const userRouter = require('./user.route');
const staticRouter = require('./static.router');
const viewsRouter = require('./views.route');
const contactRouter = require('./contact.route');  // Import the contact router
const storeRouter = require('./store.route');  // Import the new store router

module.exports = {
  userRouter,
  staticRouter,
  viewsRouter,
  contactRouter,  // Export the contact router
  storeRouter,  // Export the new store router
};
