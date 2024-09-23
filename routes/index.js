const userRouter = require('./user.route');
const staticRouter = require('./static.router');
const viewsRouter = require('./views.route');
const contactRouter = require('./contact.route');  
const storeRouter = require('./store.route'); 
const emailSendRouter = require('./email.send.route');
const BannedRouter = require('./banned.route');

module.exports = {
  userRouter,
  staticRouter,
  viewsRouter,
  contactRouter,  
  storeRouter,  
  emailSendRouter,
  BannedRouter
};
