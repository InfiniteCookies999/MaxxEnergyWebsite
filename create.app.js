const express = require('express');
const session = require('express-session');
const fs = require('fs');
const config = require('./config');
const { userRouter, staticRouter, viewsRouter, contactRouter } = require('./routes');
const { errorHandler, reroute, replaceImports } = require('./middleware');

function createApp() {

  const app = express();

  if (!config.SESSION_SECRET_KEY) {
    throw new Error("Must include SESSION_SECRET_KEY in your .env file");
  }

  // Creating the file uploading directories if they do not exist.
  if (!fs.existsSync("./public/upload")) {
    fs.mkdirSync('./public/upload');
  }
  if (!fs.existsSync("./public/upload/profilepics")) {
    fs.mkdirSync("./public/upload/profilepics")
  }

  // Using sessions to keep track of information while the user is logged in.
  app.use(session({
    resave: false,
    secret: config.SESSION_SECRET_KEY,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 1440 /* One day */  },
  }));

  app.use((req, _, next) => {
    const host = req.get('host');
    const idx = host.indexOf(':');
    if (idx === -1) {
      req.serverAddress = host;
    } else {
      req.serverAddress = host.substring(0, idx);
    }
    if (config.REROUTE_PATH) {
      req.serverAddress += "/" + config.REROUTE_PATH;
    } else {
      req.serverAddress += ":" + config.SERVER_PORT || 3000;
    }
    console.log("req.serverAddress: ", req.serverAddress);
    next();
  });
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

  /*app.get('*', (_, res) => {
    res.status(404);
    res.render("notfound", {
      route: "/someroute"
    });
    //.send();
  });*/

  return app;
}

module.exports = createApp;
