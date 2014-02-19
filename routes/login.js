var mongo       =  require('mongodb');
var monk        =  require('monk');
var crypto      =  require('crypto');

var db          =  monk('localhost:27017/vr');
var salt        = '12ab34cd56ef78gh90ij';

exports.login = function(req, res){
  if (req.method == 'POST') {
    var name = req.body.username;
    var pass = req.body.password;
    var users = db.get('users');
    users.findOne({emailid:name}).on('success', function(doc) {
        if (doc != null) {
            var encpass = crypto.createHash('sha1').update(pass+salt).digest('hex');
            if (doc.password == encpass) { 
                var isAdmin = (name == 'admin@zipvilla.com' ? true : false); 
                var user = doc.firstname + ' ' + doc.lastname;
                req.session.user = user;
                req.session.isadmin = isAdmin;
                req.session.expires = new Date(Date.now() + 20000);
                res.render('index', {loggedin: user, isadmin: isAdmin}); 
            }
            else {
                res.render('login'); 
            }
        }
        else {
            res.render('login'); 
        }
    })
    return;
  }    
  if (typeof req.session.user != 'undefined') {
    res.render('login', {loggedin:req.session.user, isadmin:req.session.isadmin});
  }
  else {
    res.render('login');
  }
};

exports.logout = function(req, res) {
    delete req.session.user;
    delete req.session.isadmin;
    delete req.session.expires;
    res.render('login');
}
