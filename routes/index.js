const userRouter = require('./user.route');
const staticRouter = require('./static.router');
const viewsRouter = require('./views.route');
const contactRouter = require('./contact.route');  // Import the new contact router

module.exports = {
  userRouter,
  staticRouter,
  viewsRouter,
  contactRouter,  // Export the new contact router
};
