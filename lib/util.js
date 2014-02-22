
exports.addsessionuser = function(req, data) {
    if (typeof req.session.user != 'undefined') {
        data.loggedin = req.session.user;
        data.isadmin = req.session.isadmin;
    }
};
