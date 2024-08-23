const express = require('express');
const { controller } = require('../middleware'); 
const { UserService } = require('../services');
const { UserRepository } = require('../database');
const config = require('../config');

const router = express.Router();

function getReroute() {
  return config.REROUTE_PATH || '';
}

router.get('/profile', controller(async (req, res) => {
  
  if (!req.session.user) {
    // Cannot display the user's profile page if the user is not even
    // logged in. Redirecting the user to the home page.
    return res.redirect(`${getReroute()}/`);
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
    return res.redirect(`${getReroute()}/`);
  }
  
  res.render("login");
}));

router.get('/register', controller(async (req, res) => {
  if (req.session.user) {
    // The user is already logged in so redirecting them to the home page.
    return res.redirect(`${getReroute()}/`);
  }
  
  res.render("register", {
    maxNameLength: UserRepository.maxNameLength(),
    maxAddressLineLength: UserRepository.maxAddressLineLength(),
    maxPasswordLength: UserRepository.maxPasswordLength()
  });
}));

router.get('/logout', controller(async (req, res) => {
  if (req.session.user) {
    delete req.session.destroy();
  }
  res.redirect(`${getReroute()}/`);
}));

router.get('/faq', controller(async (req, res) => {
  res.render("faq");
}));

module.exports = router;