module.exports = {
  verifyLoginAdmin: (req, res, next) => {
    if (req.session.adminId) {
      next();
    } else {
      res.redirect("/admin");
    }
  },
  verifyLoginUser: (req, res, next) => {
    if (req.session.userEmail) {
      next();
    } else {
      res.redirect("/login");
    }
  },
  verifyLoginUserWithoutSession: (req, res, next) => {
    if (!req.session.userEmail) {
      next()
    } else {
      res.redirect('/')
    }
  }
};
