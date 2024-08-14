const getMessage = (err) => {
  switch (err.statusCode) {
    case 400:
      return JSON.parse(err.message);
    case 401:  
      return err.message;
    case 404:
      return err.message || "Page does not exist";
    default:
      return "Internal server error";
  }
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