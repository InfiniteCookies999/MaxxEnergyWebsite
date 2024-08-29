const express = require('express');
const axios = require('axios');
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
    // Send each preload image as a separate variable
    preloadImage1: '/webdev/images/homepage.jpg',
    preloadImage2: '/webdev/images/homepage2.jpg',
    preloadImage3: '/webdev/images/homepage3.jpg'
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
    emailVerified: user.emailVerified,

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

router.get('/verify-email/:token', controller(async (req, res) => {
  const isLoggedIn = req.session.user !== undefined;

  let isValid = true;
  let userId = 0;
  let userIdMatches = true;
  try {

    const verifyRes = await axios.put(`http://${req.serverAddress}/api/user/verify-email/${req.params.token}`);
    // TODO: Deal with this case better!
    if (req.session.user) {
      if (req.session.user.id !== verifyRes.userId) {
        userIdMatches = false;
      }
    }

    userId = verifyRes.data.userId;

  } catch (err) {
    const response = err.response;
    if (response.status === 401 && response.data !== undefined 
      && response.data.message === "Invalid email token") {
      isValid = false;
    } else {
      throw err;
    }
  }

  let firstName = '';
  let lastName = '';
  if (isValid) {
    const user = await UserService.getUserById(userId);
    firstName = user.firstName;
    lastName = user.lastName;
  }

  res.render("email-verify-landing", {
    isValid,
    isLoggedIn,
    userIdMatches,
    name: firstName + " " + lastName
  });
}));

router.get('/request-password-reset', controller(async (req, res) => {
  res.render('request-password-reset', {
    email: req.query.email || ''
  });
}));

router.get('/header', (_, res) => {
  res.render('header');
});

module.exports = router;