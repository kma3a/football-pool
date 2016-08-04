
function isAdmin(req, res, next) {
  if (req.session.isLoggedIn && req.user.admin){
    return next();
  } else {
    res.redirect('/login');
  }

}

function isLoggedIn(req, res, next) {
  if (req.session.isLoggedIn){
    return next();
  } else {
    res.redirect('/login');
  }
}

module.exports = {
  isAdmin: isAdmin,
  isLoggedIn: isLoggedIn
};

