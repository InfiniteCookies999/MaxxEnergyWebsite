const express = require('express');
const axios = require('axios');
const { controller } = require('../middleware'); 
const { UserService, FileService } = require('../services');
const { UserRepository, UserRoleRepository } = require('../database');
const config = require('../config');

const router = express.Router();

function getReroute() {
  return config.REROUTE_PATH || '';
}

function getSessionCookie(req) {
  const cookies = req.headers.cookie.split(';');
  return cookies.find(cookie => cookie.trim().startsWith("connect.sid="));
}

// https://stackoverflow.com/questions/14127411/use-a-route-as-an-alias-for-another-route-in-express-js
router.get(['/', '/index', '/home', '/main'], controller(async (req, res) => {
  let baseUrl = '';
  if (config.REROUTE_PATH) {
    baseUrl = "/" + config.REROUTE_PATH + "/";
  }

  res.render('index', {
    preloadImage1: baseUrl + '/images/homepage1.jpg'
  });
}));

// User profile route
router.get('/user-profile', controller(async (req, res) => {
  if (!req.session.user) {
    // Cannot display the user's profile page if the user is not even logged in
    return res.redirect(`/${getReroute()}`);
  }

  const user = await UserService.getUser(req.session);

  const profilePicFile = FileService
    .fixStoredFile(user.id, user.profilePicFile, "upload/profilepics", "images/default-profile-icon.jpg");
  
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

// Login route
router.get('/login', controller(async (req, res) => {
  if (req.session.user) {
    // The user is already logged in, so redirect them to the home page
    return res.redirect(`/${getReroute()}`);
  }

  res.render("login");
}));

// Register route
router.get('/register', controller(async (req, res) => {
  if (req.session.user) {
    // The user is already logged in, so redirect them to the home page
    return res.redirect(`/${getReroute()}`);
  }

  res.render("register", {
    maxNameLength: UserRepository.maxNameLength(),
    maxAddressLineLength: UserRepository.maxAddressLineLength(),
    maxPasswordLength: UserRepository.maxPasswordLength()
  });
}));

// Logout route
router.get('/logout', controller(async (req, res) => {
  if (req.session.user) {
    req.session.destroy();  // Destroy session properly
  }
  res.redirect(`/${getReroute()}`);
}));

// FAQ route
router.get('/faq', controller(async (req, res) => {
  res.render("faq");
}));

// About Us route
router.get('/about-us', controller(async (req, res) => {
  let baseUrl = '';
  if (config.REROUTE_PATH) {
    baseUrl = "/" + config.REROUTE_PATH + "/";
  }

  res.render('about-us', {
    preloadImage: baseUrl + '/images/about.png'
  });
}));

// Route for rendering the header
router.get('/header', controller(async (req, res) => {
  // Render the header view with login status
  res.render('header', { isLoggedIn : req.session.user !== undefined });
}));

// Verify Email route
router.get('/verify-email/:token', controller(async (req, res) => {
  const isLoggedIn = req.session.user !== undefined;

  let isValid = true;
  let userId = 0;
  let userIdMatches = true;
  try {
    const verifyRes = await axios.put(`http://${req.serverAddress}/api/user/verify-email/${req.params.token}`);
    
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

  res.render("verify-email", {
    isValid,
    userIdMatches,
    name: firstName + " " + lastName
  });
}));

// Password Reset route
router.get('/password-reset/:token', controller(async (req, res) => {
  if (req.session.user) {
    // Cannot reset the token when the user is logged in.
    return res.redirect("/");
  }

  const response = await axios.get(`http://${req.serverAddress}/api/user/check-password-reset-token/${req.params.token}`);

  res.render('password-reset', {
    isValid: response.data.isValid
  });
}));

// Request Password Reset route
router.get('/request-password-reset', controller(async (req, res) => {
  res.render('request-password-reset', {
    email: req.query.email || ''
  });
}));

// Data route for background image load
router.get('/data', controller(async (req, res) => {
  if (!req.session.user) {
    // Cannot display the user's profile page if the user is not even logged in. Redirecting the user to the home page.
    return res.redirect(`/${getReroute()}`);
  }

  let baseUrl = '';
  if (config.REROUTE_PATH) {
    baseUrl = "/" + config.REROUTE_PATH + "/";
  }
  res.render('data', {
    preloadImage: baseUrl + '/images/data.png',
  });
}));

router.get('/admin/contact-messages', controller(async (req, res) => {
  // Make sure the user is logged in.
  if (!req.session.user) {
    return res.redirect(`/${getReroute()}`);
  }

  if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
    // The user is not an administrator!
    return res.redirect(`/${getReroute()}`);
  }

  const response = await axios.get(`http://${req.serverAddress}/api/contact/messages?page=0`, {
    headers: {
      'Cookie': getSessionCookie(req)
    }
  });
  const messageInfo = response.data;

  res.render("contact-messages", {
    initialialMessages: messageInfo.messages,
    totalPages: messageInfo.totalPages
  });
}));

router.get('/admin/user-management', controller(async (req, res) => {
  // Make sure the user is logged in.
  if (!req.session.user) {
    return res.redirect(`/${getReroute()}`);
  }

  if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
    // The user is not an administrator!
    return res.redirect(`/${getReroute()}`);
  }
  
  const response = await axios.get(`http://${req.serverAddress}/api/user/users?page=0`, {
    headers: {
      'Cookie': getSessionCookie(req)
    }
  });
  const userInfo = response.data;

  res.render('user-management', {
    totalPages: userInfo.totalPages,
    initialialUsers: userInfo.users
  });
}));

// About Us route
router.get('/security', controller(async (req, res) => {
  let baseUrl = '';
  if (config.REROUTE_PATH) {
    baseUrl = "/" + config.REROUTE_PATH + "/";
  }

  res.render('security', {
    preloadImage: baseUrl + '/images/security.jpeg'
  });
}));

module.exports = router;
