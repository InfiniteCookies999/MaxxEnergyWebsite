const express = require('express');
const session = require('express-session');
const config = require('./config');
const { userRouter, staticRouter } = require('./routes');
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
    // This is only the user's session cookie. The session will still be open even once the session cookie expires.
    cookie: { maxAge: 60000 * 1 },
  }));

  // Installing routes.
  app.use('/api/', userRouter);
  app.use(staticRouter);

  // Install middleware
  app.use(errorHandler);

  return app;
}

module.exports = createApp;