const { validationResult } = require('express-validator');
const HttpError = require('./http.error');

function validateBody(req, _, next) {
  const errorResult = validationResult(req);
  if (!errorResult.isEmpty()) {
    // Creating the error message from the express validator
    // and sending it onto the error handler.
    const error = new HttpError(JSON.stringify({
      errors: errorResult.array()
    }), 400);
    next(error);
  } else {
     // No error in the body of the json continue with route.
     next();
  }
}

function validateLoggedIn(req, _, next) {
  if (!req.session.user) {
    next(new HttpError("Must be logged in", 401));
  } else {
    // No error continue with the route.
    next();
  }
}

function validateFileExists(req, _, next) {
  if (!req.file) {
    next(new HttpError("Missing file", 400));
  } else {
    next();
  }
}

module.exports = {
  validateBody,
  validateLoggedIn,
  validateFileExists
}