const express = require('express');
const { controller } = require('../middleware'); 
const { UserService, FileService } = require('../services');
const { UserRepository } = require('../database');
const config = require('../config');

const router = express.Router();

function getReroute() {
  return config.REROUTE_PATH || '';
}


// https://stackoverflow.com/questions/14127411/use-a-route-as-an-alias-for-another-route-in-express-js
router.get(['/', '/index', '/home', '/main'], controller(async (req, res) => {
  res.render('index', {
    // Preloads my background images on my homepage, for no delay. 
    preloadImages: [
      '/webdev/images/homepage.jpg',
      '/webdev/images/homepage2.jpg',
      '/webdev/images/homepage3.jpg'
    ]
  });
}));


router.get('/user-profile', controller(async (req, res) => {
  
  if (!req.session.user) {
    // Cannot display the user's profile page if the user is not even
    // logged in. Redirecting the user to the home page.
    return res.redirect(`/${getReroute()}`);
  }

  const user = await UserService.getUser(req.session);

  const profilePicFile = FileService
    .fixStoredFile(user.id,
                   user.profilePicFile,
                   "upload/profilepics",
                   "images/default-profile-icon.jpg");
  
  const acceptedMimeTypes = UserRepository.validProfilePicMimetypes()
    .map(s => s.substring(s.indexOf('/') + 1))
    .map(s => " ." + s)
    .join()
    .substring(1);

  res.render('user-profile', {
    // User information
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    county: user.county.replaceAll("-", " "),
    state: user.state,
    zipCode: user.zipCode,
    profilePicFile: profilePicFile,
    acceptedMimeTypes: acceptedMimeTypes,

    // Form restrictions
    maxNameLength: UserRepository.maxNameLength(),
    maxAddressLineLength: UserRepository.maxAddressLineLength(),
    maxPasswordLength: UserRepository.maxPasswordLength()
  });
}));

router.get('/login', controller(async (req, res) => {
  if (req.session.user) {
    // The user is already logged in so redirecting them to the home page.
    return res.redirect(`/${getReroute()}`);
  }
  
  res.render("login");
}));

router.get('/register', controller(async (req, res) => {
  if (req.session.user) {
    // The user is already logged in so redirecting them to the home page.
    return res.redirect(`/${getReroute()}`);
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
  res.redirect(`/${getReroute()}`);
}));

router.get('/faq', controller(async (_, res) => {
  res.render("faq");
}));

router.get('/email', controller(async (req, res) => {
  res.render("emailverify", {
    name: "Maddie Rugh",
    maxxLogoPath: "http://" + req.serverAddress + "/images/maxx-logo.png",
    verifyLink: "http://" + req.serverAddress + "/verify/"
  });
}));

module.exports = router;