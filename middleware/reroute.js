const config = require('../config');
const fs = require('fs');
const path = require('path');

function replaceRoutes(body) {
  return body.replaceAll(/href=(["'])((?!http).*)\1/g, (match, _, p2) => {
    const slash = p2.startsWith('/') ? '' : '/';
    if (match.includes("\"")) {
      return `href="/${config.REROUTE_PATH}${slash}${p2}"`;
    } else {
      return `href='/${config.REROUTE_PATH}${slash}${p2}'`;
    }
  })
  .replaceAll(/src=(["'])((?!http).*)\1/g, (match, _, p2) => {
    const slash = p2.startsWith('/') ? '' : '/';
    if (match.includes("\"")) {
      return `src="/${config.REROUTE_PATH}${slash}${p2}"`;
    } else {
      return `src='/${config.REROUTE_PATH}${slash}${p2}'`;
    }
  })
  // Add the base url for javascript.
  .replaceAll(/base-url=""/g, `base-url="/${config.REROUTE_PATH}"`);
}

function reroute(req, res, next) {
  req.originalUrl = req.url;

  // Removing the config route since the rest of the application does
  // not care about this routing information.
  if (config.REROUTE_PATH) {
    const path = '/' + config.REROUTE_PATH;
    if (req.url.startsWith(path)) {
      req.url = req.url.substring(path.length);
    }
  }
  
  if (!req.url.startsWith('/')) {
    req.url = '/' + req.url;
  }

  if (req.method === 'GET') {
    let noQueryUrl = req.url;
    const queryIdx = noQueryUrl.indexOf('?')
    if (queryIdx !== -1) {
      noQueryUrl = noQueryUrl.substring(0, queryIdx - 1);
    }
    
    const pathExtension = path.extname(noQueryUrl).toLowerCase();
    if (pathExtension === "" || pathExtension === "html") {
      
      if (req.url === '/') {
        req.url = "/index";
      }

      let htmlFilePath = path.join(__dirname, '../public', req.url);
      if (!htmlFilePath.endsWith('.html')) {
        htmlFilePath = htmlFilePath + ".html";
      }
      
      if (fs.existsSync(htmlFilePath)) {
        // Manually serving the html.

        let body = fs.readFileSync(htmlFilePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        if (config.REROUTE_PATH) {
          body = replaceRoutes(body);
        }
        console.log("sending html: ", htmlFilePath);
        return res.send(body);

      }

      // At this point we can assume it is an hbs endpoint
      // Because of redirect mechanisms it can cache. Disabling that.
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // We have to replace at the point of send because the hbs
      // engine needs to do it's work first!
      if (config.REROUTE_PATH) {
        const osend = res.send;
        res.send = function (body) {
          return osend.call(this, replaceRoutes(body));
        };
      }
      return next();
    } 
  }

  next();
}

module.exports = { 
  reroute,
  replaceRoutes
}