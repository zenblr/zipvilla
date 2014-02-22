var mongo       =  require('mongodb');
var monk        =  require('monk');
var async       =  require("async");
var util        =  require("../lib/util");


var db          =  monk('localhost:27017/vr');

var listingscoll   =  db.get('listings');

var data = {};

exports.index = function(req, res){
  var series = [];
  series.push(function(callback) {
        getSponsoredListings(function(results) {
            for (var i=0; i<results.length; i++) {
                var city = results[i].address.city;
                var image = results[i].images[0];     
                city = city.replace(/\s+/, '').toLowerCase();
                results[i].image = '/images/listings/'+city+'/'+image;
            }
            data.sponsored = results; 
            callback(null,{});
        });
  });
  series.push(function(callback) {
        getMostViewedListings(function(results) {
            for (var i=0; i<results.length; i++) {
                var city = results[i].address.city;
                var image = results[i].images[0];     
                city = city.replace(/\s+/, '').toLowerCase();
                results[i].image = '/images/listings/'+city+'/'+image;
            }
            console.log('Most Viewed '+results.length);
            data.mostviewed = results; 
            callback(null,{});
        });
  });
  series.push(function(callback) {
        getBestRatedListings(function(results) {
            for (var i=0; i<results.length; i++) {
                var city = results[i].address.city;
                var image = results[i].images[0];     
                city = city.replace(/\s+/, '').toLowerCase();
                results[i].image = '/images/listings/'+city+'/'+image;
            }
            data.bestrated = results; 
            console.log('Best Rated '+results.length);
            callback(null,{});
        });
  });
  series.push(function(callback) {
        getMostBookedListings(function(results) {
            for (var i=0; i<results.length; i++) {
                var city = results[i].address.city;
                var image = results[i].images[0];     
                city = city.replace(/\s+/, '').toLowerCase();
                results[i].image = '/images/listings/'+city+'/'+image;
            }
            data.mostbooked = results; 
            console.log('Most Booked '+results.length);
            callback(null,{});
        });
  });
  async.series(series, function(err, results) {
    if (data.mostbooked.length == 0) {
        data.mostbooked = data.sponsored;
    }
    if (data.mostviewed.length == 0) {
        data.mostviewed = data.sponsored;
    }
    if (data.bestrated.length == 0) {
        data.bestrated = data.sponsored;
    }
    util.addsessionuser(req, data); 
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
    var sponsoredcoll  =  db.get('sponsored');
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

function getMostViewedListings(cb) {
    var results = [];
    var mostviewedcoll  =  db.get('mostviewed');
    mostviewedcoll.find({}, function(err, docs) {
        if (!err) {
            if (docs.length > 0) {
                getListings(docs, results, function(results){
                   return cb(results); 
                });
            }
            else {
                return cb(results);
            }
        }
        else {
            return cb(results);
        }
    });
}

function getBestRatedListings(cb) {
    var results = [];
    var bestratedcoll  =  db.get('bestrated');
    bestratedcoll.find({}, function(err, docs) {
        if (!err) {
            if (docs.length > 0) {
                getListings(docs, results, function(results){
                   return cb(results); 
                });
            }
            else {
                return cb(results);
            }
        }
        else {
            return cb(results);
        }
    });
}

function getMostBookedListings(cb) {
    var results = [];
    var mostbookedcoll  =  db.get('mostbooked');
    mostbookedcoll.find({}, function(err, docs) {
        if (!err) {
            if (docs.length > 0) {
                getListings(docs, results, function(results){
                   return cb(results); 
                });
            }
            else {
                return cb(results);
            }
        }
        else {
            return cb(results);
        }
    });
}
