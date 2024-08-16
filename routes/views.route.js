const express = require('express');
const { controller } = require('../middleware'); 
const { UserService } = require('../services');

const router = express.Router();

router.get('/profile', controller(async (req, res) => {
  
  if (!req.session.user) {
    // Cannot display the user's profile page if the user is not even
    // logged in. Redirecting the user to the home page.
    return res.redirect("/");
  }

  const user = await UserService.getUser(req.session);

  res.render('profile', {
    firstName: user.firstName,
    lastName: user.lastName
  });
}));

router.get('/login', controller(async (req, res) => {
  if (req.session.user) {
    // The user is already logged in so redirecting them to the home page.
    return res.redirect("/");
  }
  
  res.render("login");
}));

module.exports = router;