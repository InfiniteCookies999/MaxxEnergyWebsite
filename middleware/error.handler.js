const getMessage = (err) => {
  if (err.statusCode === 400) {
    // Parse json from express-validator.
    return JSON.parse(err.message);
  }
  if (err.statusCode == 404) {
    return err.message || "Page does not exist";
  }
  if (err.statusCode >= 400 && err.statusCode <= 499) {
    return err.message;
  }
  console.log(err);
  return "Internal server error";
}

const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500)
     .setHeader('Content-Type', 'application/json')
     .json({
        "errorPage": "/error-landing-page",
        "message": getMessage(err)
     });
}; 

module.exports = errorHandler;