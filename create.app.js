const express = require('express');
const session = require('express-session');
const config = require('./config');
const { userRouter, staticRouter, viewsRouter, contactRouter } = require('./routes');
const { errorHandler, reroute, replaceImports } = require('./middleware');

function createApp() {

  const app = express();

  if (!config.SESSION_SECRET_KEY) {
    throw new Error("Must include SESSION_SECRET_KEY in your .env file");
  }

  // Using sessions to keep track of information while the user is logged in.
  app.use(session({
    resave: false,
    secret: config.SESSION_SECRET_KEY,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 1440 /* One day */  },
  }));

  app.use(replaceImports);
  app.use(reroute);

  // Set the view engine.
  app.set('view engine', 'hbs');
  app.set('views', 'public');

  // Routers
  app.use('/api/', userRouter);
  app.use(viewsRouter);
  app.use('/api/contact', contactRouter); // Add the contact router
  app.use(staticRouter);

  // Install middleware
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
