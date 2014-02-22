var sm          =  require('../lib/searchmanager');
var util        =  require('../lib/util');

var facets      = ['amenities', 'onsite_services', 'suitability', 'address__location', 'shared'];

exports.index = function(req, res){
    var params = req.body;
    doSearch(params, function(results, qparams) {
        util.addsessionuser(req, results);
        results.qparams = qparams;
        //console.log(JSON.stringify(results.facets));
        res.render('search', results); 
    });
};

exports.searchcity = function(req, res) {
    var term = req.query.term.toLowerCase()+'*';
    var q = {city_state: term};
    sm.searchcity(q, function(results) {
        res.send(results);
    });
};

function doSearch(params, cb) {
   if (typeof params.query == 'undefined') {
        params.query = '*';
   } 
   if (typeof params.price_range != 'undefined') {
        if (typeof params.price_range == 'string') {
            var range = params.price_range.match(/([0-9]+)/g);
            if (range.length == 2) {
                params.price_range = range;
            }
            else {
                delete params.price_range;
            }
        }
   }
   if (typeof params.price_range == 'undefined') {
       params.price_range = [100, 20000];
   }

   var q = {};
   
   if (params.query == '*') {
        q.city_state  = [params.query];
   }
   else {
        var nterms = [];
        var t = params.query.replace(/[^a-zA-Z0-9]+/g, ' ');
        var terms = t.split(' ');
        terms.forEach(function(term) {
            nterms.push("'"+term+"'");    
        });
        q.city_state  = nterms;
   }     

   facets.forEach(function(facet) {
        if (typeof params[facet] != 'undefined') {
            if (typeof q[facet] == 'undefined') {
                q[facet] = [];
            }
            params[facet].forEach(function(f) {
                f = f.replace(/[\0-\x1F\x80-\xFF]/g, '');
                q[facet].push("'"+f+"'");
            });
        }
        
   }); 

   if (typeof params.keywords != 'undefined') {
        if (params.keywords != '') {
            var keywords = params.keywords.split(' ');
            var nkeywords = [];
            keywords.forEach(function(k) {
                nkeywords.push("'"+k+"'");
            });
            q.keywords = nkeywords;
        }
   }

   if ((typeof params.check_in == 'undefined') || (params.check_in == '')) {
        params.check_in = null;
   }
   if ((typeof params.check_out == 'undefined') || (params.check_out == '')) {
        params.check_out = null;
   }

   var qparams = {query: q,
                  checkin: params.check_in,
                  checkout: params.check_out,
                  guests: (typeof params.guests == 'undefined'? 1 : params.guests),
                  sort: (typeof params.sort == 'undefined' ? 'r' : params.sort),
                  pricerange: params.price_range,
                  page: (typeof params.page == 'undefined' ? 1 : params.page),
                  pagesize: 20} 

   sm.search(qparams, function (results) {
        return cb(results, qparams);
   });
}


