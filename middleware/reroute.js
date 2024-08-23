const config = require('../config');
const fs = require('fs');
const path = require('path');

function replaceRoutes(body) {
  return body.replaceAll(/href=["']((?!http).*)["']/g, (match, p1) => {
    const slash = p1.startsWith('/') ? '' : '/';
    if (match.includes("\"")) {
      return `href="/${config.REROUTE_PATH}${slash}${p1}"`;
    } else {
      return `href='/${config.REROUTE_PATH}${slash}${p1}'`;
    }
  });
}

function reroute(req, res, next) {
  // Removing the config route since the rest of the application does
  // not care about this routing information.
  if (config.REROUTE_PATH) {
    const path = '/' + config.REROUTE_PATH;
    if (req.url.startsWith(path)) {
      req.url = req.url.substring(path.length);
    }
  }
  
  console.log("req.url: ", req.url);

  if (req.method === 'GET') {
    const pathExtension = path.extname(req.url).toLowerCase();
    if (pathExtension === "" || pathExtension === "html") {
      
      if (req.url === '/') {
        req.url = "/index";
      }
      
      let filePath = path.join(__dirname, '../public', req.url);
      if (filePath.endsWith('.html')) {
        filePath = filePath.substring(0, filePath.length() - 5);
      }
      
      if (fs.existsSync(filePath + '.html')) {
        // Manually serving the html.

        let body = fs.readFileSync(filePath + '.html', 'utf8');
        res.setHeader('Content-Type', 'text/html');
        if (config.REROUTE_PATH) {
          body = replaceRoutes(body);
        }
        console.log("sending html: ", filePath);
        res.send(body);

      } else if (fs.existsSync(filePath + '.hbs')) {
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
        next();
      } else {
        next();
      }
    } else {
      next();
    }
  } else {
    next();
  }
}

module.exports = { 
  reroute,
  replaceRoutes
}