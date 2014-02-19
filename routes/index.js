var mongo       =  require('mongodb');
var monk        =  require('monk');

var db          =  monk('localhost:27017/vr');

var sponsoredcoll  =  db.get('sponsored');
var listingscoll   =  db.get('listings');

var data = {};

exports.index = function(req, res){
  getSponsoredListings(function(results) {
    for (var i=0; i<results.length; i++) {
       var city = results[i].address.city;
       var image = results[i].images[0];     
       city = city.replace(/\s+/, '').toLowerCase();
       results[i].image = '/images/listings/'+city+'/'+image;
    }
    data.sponsored = results; 
    if (typeof req.session.user != 'undefined') {
        data.loggedin = req.session.user;
        data.isadmin = req.session.isadmin;
    }
    res.render('index', data);
  });
};

function getListings(docs, results, cb) {
    var doc = docs.shift();
    listingscoll.findById(doc.listing.oid, function(err, doc) {
        if ((!err) && doc) {
            results.push(doc);
        }
        if (docs.length > 0) {
            getListings(docs, results, cb);
        }
        else {
            return cb(results);
        }
    });
}

function getSponsoredListings(cb) {
    var results = [];
    sponsoredcoll.find({}, function(err, docs) {
        if (!err) {
            if (docs.length > 0) {
                getListings(docs, results, function(results){
                   return cb(results); 
                });
            }
        }
        else {
            return cb(results);
        }
    });
}


