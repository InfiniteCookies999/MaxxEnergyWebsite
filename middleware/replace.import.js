const config = require('../config');
const fs = require('fs');
const path = require('path');
const { replaceRoutes } = require('./reroute');

function replace(body) {
  return body.replaceAll(/<import\s*href="(.*)"><\/import>/g, (_, p1) => {
    let filePath = path.join(__dirname, '../public', p1 + ".html");
    const importBody = fs.readFileSync(filePath, 'utf8');
    // Reroute the imported body if we need to.
    if (config.REROUTE_PATH) {
      importBody = replaceRoutes(importBody);
    }
    return importBody;
  });
}

function replaceImports(_, res, next) {
  const osend = res.send;
  res.send = function (body) {
    return osend.call(this, replace(body));
  };
  next();
}

module.exports = replaceImports;