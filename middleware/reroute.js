const config = require('../config');
const fs = require('fs');
const path = require('path');

function replaceRoutes(body) {
  return body.replaceAll(/href=["']((?!http).*)["']/g, (_, p1) => {
    const slash = p1.startsWith('/') ? '' : '/';
    return `href="/${config.REROUTE_PATH}${slash}${p1}"`;
  });
}

async function replaceInBody(body) {
  // Begin by replacing routes.
  body = replaceRoutes(body);
  // Replace import tags with their bodies.
  return await body.replaceAll(/<import\s*href="(.*)"><\/import>/g, async (_, p1) => {
    // Let us start by finding the html file.
    let filePath = path.join(__dirname, '../public', p1 + ".html");
    const body = await fs.promises.readFile(filePath + '.html', 'utf8');
    return body;
  });
}

async function reroute(req, res, next) {
  if (req.method === 'GET') {
    const pathExtension = path.extname(req.url).toLowerCase();
    if (pathExtension === "" || pathExtension === "html") {
      console.log("It is html or hbs");

      if (req.url === '/') {
        req.url = "/index";
      }
      
      let filePath = path.join(__dirname, '../public', req.url);
      if (filePath.endsWith('.html')) {
        filePath = filePath.substring(0, filePath.length() - 5);
      }
      console.log("File path: ", filePath);

      if (fs.existsSync(filePath + '.html')) {
        // Manually serving the html.

        console.log("Trying to serve html");
        
        const body = await fs.promises.readFile(filePath + '.html', 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(replaceInBody(body));

      } else if (fs.existsSync(filePath + '.hbs')) {
        // We have to replace at the point of send because the hbs
        // engine needs to do it's work first!
        const osend = res.send;
        res.send = function (body) {
          return osend.call(this, replaceInBody(body));
        };
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

module.exports = reroute;