const errorHandler = (err, req, res, next) => {
  // TODO: Improve these by having the error message take a payload
  // of some static source to send to the client!
  if (err.statusCode == 400) {
    res.status(err.statusCode)
       .setHeader('Content-Type', 'application/json')
       .end(err.message);
  } else if (err.statusCode == 401) {
    res.status(err.statusCode)
       .setHeader('Content-Type', 'text/plain')
       .end(err.message);
  } else if (err.statusCode == 404) {
    res.status(err.statusCode)
       .setHeader('Content-Type', 'text/plain')
       .end(err.message || "Page does not exist");
  } else {
    console.error(err.stack);
    res.status(err.statusCode || 500).send('Internal server error');
  }
}; 

module.exports = errorHandler;