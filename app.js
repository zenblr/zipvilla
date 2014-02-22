
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var login = require('./routes/login');
var search = require('./routes/search');
var http = require('http');
var path = require('path');

var app = express();
var mongostore = require('connect-mongo')(express);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
//app.use(express.session({secret:'ZipVillaSecret', cookie: {expires: 10000}}));
app.use(express.session({secret:'ZipVillaSecret', store: new mongostore({db:'vr'})}));
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*app.all('*', function(req, res, next) { 
    if ('HEAD' == req.method || 'OPTIONS' == req.method) return next();
    // break session hash / force express to spit out a new cookie once per second at most
    req.session._garbage = Date();
    req.session.touch();
    next();
}); */
app.all('*', function(req, res, next) { 
    if (typeof req.session.expires != 'undefined') {
        if (Date.now() > req.session.expires) {
            delete req.session.user;
            delete req.session.isadmin;
            delete req.session.expires;
        }
        else {
            req.session.expires = Date.now() + 20000;
        }
    }
    next();
}); 

app.get('/', routes.index);
app.get('/login', login.login);
app.post('/login', login.login);
app.get('/logout', login.logout);
app.get('/users', user.list);
app.post('/search', search.index);
app.get('/searchcity', search.searchcity);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
