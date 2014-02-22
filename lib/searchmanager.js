var mongo       =  require('mongodb');
var monk        =  require('monk');
var solr        =  require('solr-client');

var db          =  monk('localhost:27017/vr');
var client      =  solr.createClient('localhost','8080','','/solr');
var facetoperators = {amenities:'AND',onsite_services:'AND',suitability:'AND',shared:'OR',address__location:'OR'};
var stdfields   = ['title', 'address__street_name', 'address__location', 'address__city', 'address__state',
                   'guests', 'rating', 'reviews', 'address__country', 'average_rate', 'address__coordinates__latitude',
                   'address__coordinates__longitude', 'images', 'id'];

exports.search = function(params, cb) {
    var solrquery = client.createQuery();
    if ((typeof params.query == 'undefined') || (params.query == null)) {
        return cb({docs:[], facets:[], count:0});
    }

    var pricerange = params.pricerange;
    
    if ((params.checkin == null) && (params.checkout == null)) {
        pricerange = null;
    }

    var querystring = buildquery(params.query, params.guests, pricerange);
    console.log(querystring);
    var start = (params.page - 1)*params.pagesize;
    solrquery.q(querystring);

    if ((params.checkin != null) && (params.checkout != null)) { //With dates, retrieve data from Mongo not Solr.
        solrquery.fl('id');
    }
    else {
       
        solrquery.fl(stdfields);
        solrquery.start(start);
        solrquery.rows(params.pagesize);

        switch(params.sort) {
            case 'hl':solrquery.sort('average_rate desc');
                      break;
            case 'lh':solrquery.sort('average_rate asc');
                      break;
            default:  solrquery.sort('rating desc');
                      break;
        }
    }
    var facets = Object.keys(facetoperators);
    solrquery.facet({on:true, field:facets});
      
    client.search(solrquery, function(err,obj) {
        if(err) {
            console.log(err);
            return cb({docs:[], facets:[], count:0});
        }
        else  {
            console.log("Solr reponse: "+obj.response.numFound+" results.");
            //console.log(JSON.stringify(obj.response));
            var docs = obj.response.docs;
            var doc_count = obj.response.numFound;
            if ((typeof docs == 'undefined') || (docs == null)) { 
                return cb({docs:[], facets:[], count:0});
            }
            if ((typeof obj.facet_counts !== 'undefined') &&
               (typeof obj.facet_counts.facet_fields !== 'undefined')) {
                facets = obj.facet_counts.facet_fields;
            }
            else {
                facets = {};
            }
            if ((params.checkin != null) && (params.checkout != null)) {
                solrquery.rows(obj.response.numFound);//query again to get full data set.
                client.search(solrquery, function(err,obj) {
                    if(err) {
                        console.log(err);
                        return cb({docs:[], facets:[], count:0});
                    }
                    else {
                        docs = obj.response.docs;
                        var ids = [];
                        docs.forEach(function(doc) {
                            ids.push(doc.id)
                        });
                        return cb({docs:docs,facets:facets,count:doc_count}); 
                        //$lm = new ZipVilla_Helper_ListingsManager();
                        //$from = new MongoDate(strtotime($from));
                        //$to = new MongoDate(strtotime($to));
                        //$listings = $lm->getListings($ids, $from, $to, $start, $pagesize, $sortorder, $price_range);
                        //$docs = $listings['docs'];
                        //$doc_count = $listings['count'];
                        //return array('docs'=> $docs , 'facets' => $facets, 'count' => $doc_count); 
                    }
                });
            }
            else {
                return cb({docs:docs,facets:facets,count:doc_count}); 
            }
        }
     });
}

exports.searchcity = function(query, cb) {

    if (query == null) {
        return cb([]);
    }
    var solrquery = client.createQuery();
    var querystring = buildquery(query, 0, null);
    solrquery.q(querystring);
    solrquery.start(0);
    solrquery.facet({on:true, field:'citystate'});
    client.search(solrquery, function(err,obj) {
        if(err) {
            console.log(err);
            return cb([]);
        }
        else {
            var cities = [];
            if (typeof obj.facet_counts.facet_fields.citystate !== 'undefined') {
                var facet = obj.facet_counts.facet_fields.citystate;
                for (var i=0; i<facet.length;i+=2) {
                    if (facet[i+1] > 0) {
                        cities.push(facet[i]);
                    }
                }
            }
            return cb(cities);
        }
    });
}
        
            
function buildquery(query, guests, pricerange) {
    var qstr = [];
    if (query != null) {
        for (key in query) {
            if (Array.isArray(query[key])) {
                var op = typeof facetoperators.key == 'undefined' ? 'AND' : facetoperators[key];
                var substr = [];
                query[key].forEach(function(k) {
                    substr.push(key+':'+k);
                });
                qstr.push(substr.join(' '+op+' '));
            }
            else {
                qstr.push(key+':'+query[key]) ;
            }
        }
        if (guests > 1) {
            qstr.push('guests:['+guests+' TO *]');
        }
        if (pricerange != null) {
            qstr.push('average_rate:['+pricerange[0]+' TO '+pricerange[1]+']');
        }
    }
    return qstr.join(' AND ');
}
