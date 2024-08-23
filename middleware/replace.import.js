const config = require('../config');
const fs = require('fs');
const path = require('path');
const { replaceRoutes } = require('./reroute');

function replace(body) {
  return body.replaceAll(/<import\s*value="(.*)"><\/import>/g, (_, p1) => {
    let filePath = path.join(__dirname, '../public', p1 + ".html");
    let importBody = fs.readFileSync(filePath, 'utf8');
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
    // Making sure we only change html files!
    if (body && body.trimStart().startsWith("<!DOCTYPE html>")) {
      // Only replace if it is an html file.
      return osend.call(this, replace(body));
    } else {
      return osend.call(this, body);
    }
  };
  next();
}

module.exports = replaceImports;