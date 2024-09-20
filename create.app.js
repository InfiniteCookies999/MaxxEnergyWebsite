const express = require('express');
const session = require('express-session');
const Handlebars = require('handlebars');
const path = require('path');
const { engine } = require('express-handlebars');
const fs = require('fs');
const config = require('./config');
const {
  userRouter,
  staticRouter,
  viewsRouter,
  contactRouter,
  storeRouter,
  emailSendRouter
} = require('./routes');
const { errorHandler, reroute, replaceImports } = require('./middleware');
const BannedService = require('./services/banned.service');

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
    fs.mkdirSync("./public/upload/profilepics");
  }

  // Using sessions to keep track of information while the user is logged in.
  app.use(session({
    resave: false,
    secret: config.SESSION_SECRET_KEY,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 1440 /* One day */ },
  }));

  // Ban by ip address.
  app.use((req, res, next) => {
    
    // Filter out ipv-6 mapping.
    let ip = req.ip;
    if (ip.startsWith('::ffff:')) {
      ip = ip.split('::ffff:')[1];
    }
    if (BannedService.getBannedIps().includes(ip)) {
      return res.send("you are banned!");
    }
    next();
  });
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
      req.serverAddress += ":" + (config.SERVER_PORT || 3000);
    }
    next();
  });

  app.use(replaceImports);
  app.use(reroute);

  // Custom handlebar handlers that we can use in our hbs files!
  Handlebars.registerHelper('ifEquals', (value1, value2, options) => {
    if (value1 === value2) {
      return options.fn(this); // Render the block if true
    } else {
      return options.inverse(this); // Render the inverse block if false
    }
  });
  Handlebars.registerHelper('ifNotEquals', (value1, value2, options) => {
    if (value1 !== value2) {
      return options.fn(this); // Render the block if true
    } else {
      return options.inverse(this); // Render the inverse block if false
    }
  });

  // Set the view engine.
  app.engine('hbs', engine({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'public'),
    defaultLayout: false, // Stop it from having defualt layouts.
    helpers: Handlebars.helpers
  }));
  app.set('view engine', 'hbs');
  app.set('views', 'public');

  // Routers
  app.use('/api/', userRouter);
  app.use('/api/', contactRouter);
  app.use('/api/store', storeRouter);
  app.use('/api/', emailSendRouter);  

  app.use(viewsRouter);
  app.use(staticRouter);

  // Install middleware
  app.use(errorHandler);

  app.get('*', async (req, res) => {
    // If we get here then we are at the default not found
    // route handling.
    res.render("not-found", {
      reqUrl: req.originalUrl || ''
    });
  });

  return app;
}

module.exports = createApp;
