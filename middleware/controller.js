const controller = (controllerCallback) => {
  // If any error occures in the controller then send the error
  // to the error handler.
  return async (req, res, next) => {
    try {
      await controllerCallback(req, res);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = controller;