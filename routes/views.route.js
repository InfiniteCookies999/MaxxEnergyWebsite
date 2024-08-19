const express = require('express');
const { controller } = require('../middleware'); 
const { UserService } = require('../services');
const { UserRepository } = require('../database');

const router = express.Router();

router.get('/profile', controller(async (req, res) => {
  
  if (!req.session.user) {
    // Cannot display the user's profile page if the user is not even
    // logged in. Redirecting the user to the home page.
    return res.redirect("/");
  }

  const user = await UserService.getUser(req.session);

  res.render('profile', {
    // User information
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: "/images/default-profile-icon.jpg", // TODO: Here the profile would be loaded from database.
    email: user.email,
    phone: user.phone,
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    county: user.county.replaceAll("-", " "),
    state: user.state,
    zipCode: user.zipCode,

    // Form restrictions
    maxNameLength: UserRepository.maxNameLength(),
    maxAddressLineLength: UserRepository.maxAddressLineLength(),
    maxPasswordLength: UserRepository.maxPasswordLength()
  });
}));

router.get('/login', controller(async (req, res) => {
  if (req.session.user) {
    // The user is already logged in so redirecting them to the home page.
    return res.redirect("/");
  }
  
  res.render("login");
}));

router.get('/register', controller(async (req, res) => {
  if (req.session.user) {
    // The user is already logged in so redirecting them to the home page.
    return res.redirect("/");
  }
  
  res.render("register", {
    maxNameLength: UserRepository.maxNameLength(),
    maxAddressLineLength: UserRepository.maxAddressLineLength(),
    maxPasswordLength: UserRepository.maxPasswordLength()
  });
}));

module.exports = router;