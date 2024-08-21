const express = require('express');
const session = require('express-session');
const config = require('./config');
const { userRouter, staticRouter, viewsRouter } = require('./routes');
const { errorHandler } = require('./middleware');

function createApp() {

  const app = express();

  if (!config.SESSION_SECRET_KEY) {
    throw new Error("Must include SESSION_SECRET_KEY in your .env file");
  }

  // Using sessions to keep track of information while the user
  // is logged in.
  app.use(session({
    // This improves performance by not constantly saving session information on every request.
    resave: false,
    secret: config.SESSION_SECRET_KEY,
    // So the session persist.
    saveUninitialized: true,
    // This is how long the user is logged in for.
    cookie: { maxAge: 60000 * 1440 /* One day */  },
  }));

  // Set the view engine.
  app.set('view engine', 'hbs');
  app.set('views', 'public');

  // Installing routes.
  let baseRoute = config.BASE_ROUTE || '';
  if (baseRoute.endsWith("/")) {
    baseRoute.slice(0, -1);
  }
  if (baseRoute.startsWith("/")) {
    baseRoute = baseRoute.substring(1);
  }
  const apiRoute = baseRoute === '' ? '/api/' : `/${baseRoute}` + '/api/';
  const staticRoute = baseRoute === '' ? '' : `/${baseRoute}/`; 

  app.use(apiRoute, userRouter);
  app.use(staticRoute, viewsRouter);
  // This must be placed after the views router because they share the same directory.
  app.use(staticRoute, staticRouter);

  // Install middleware
  app.use(errorHandler);

  return app;
}

module.exports = createApp;