const config = require('../config');
const fs = require('fs');
const path = require('path');

function replaceRoutes(body) {
  return body.replaceAll(/href=["']((?!http).*)["']/g, (_, p1) => {
    const slash = p1.startsWith('/') ? '' : '/';
    return `href="/${config.REROUTE_PATH}${slash}${p1}"`;
  });
}

function reroute(req, res, next) {
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