const { validationResult } = require('express-validator');
const HttpError = require('./http.error');

function validateBody(req, res, next) {
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

module.exports = {
  validateBody
}