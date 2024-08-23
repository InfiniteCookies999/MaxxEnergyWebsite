const config = require('../config');
const fs = require('fs');
const path = require('path');
const { replaceRoutes } = require('./reroute');

function replace(body) {
  return body.replaceAll(/<import\s*href="(.*)"><\/import>/g, (_, p1) => {
    const filePath = path.join(__dirname, '../public', p1 + ".html");
    returnfs.readFileSync(filePath, 'utf8');
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