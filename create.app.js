const express = require('express');
const config = require('./config');
const { userRouter, staticRouter } = require('./routes');
const { errorHandler } = require('./middleware');

function createApp() {

  const app = express();

  // Installing routes.
  app.use('/api/', userRouter);
  app.use(staticRouter);

  // Install middleware
  app.use(errorHandler);

  return app;
}

module.exports = createApp;