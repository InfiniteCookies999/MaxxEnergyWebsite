const config = require('../config');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { replaceRoutes } = require('./reroute');
const HttpError = require('./http.error');

async function replace(body, serverAddress) {
  // Find all matches
  const matches = [...body.matchAll(/<import\s*value="(.*)"><\/import>/g)];

  // Create a list of promises to handle each match.
  const replacementPromises = matches.map(async (m) => {
    const [ match, p1 ] = m;
    let filePath = path.join(__dirname, '../public', p1);
    if (fs.existsSync(filePath + '.html')) {
      
      // Reading html file and replacing route information!
      let importBody = fs.readFileSync(filePath + '.html', 'utf8');
      // Reroute the imported body if we need to.
      if (config.REROUTE_PATH) {
        importBody = replaceRoutes(importBody);
      }
      return { match, replacement: importBody };
    } else if (fs.existsSync(filePath + '.hbs')) {
      // Need to call the hbs end point.
      const response = await axios.get(`http://${serverAddress}/${p1.substring(1)}`);
      return { match, replacement: response.data };
    } else {
      throw new HttpError("Could not find html or hbs file for importing", 404);
    }
  });

  // Resolve all the replacement functions.
  const replacements = await Promise.all(replacementPromises);
  
  // Applying all the replacements.
  let result = body;
  replacements.forEach(({ match, replacement }) => {
    result = result.replace(match, replacement);
  });

  return result;
}

async function replaceImports(req, res, next) {
  const osend = res.send;
  res.send = function (body) {
    // Making sure we only change html files!
    if (body && body.trimStart().startsWith("<!DOCTYPE html>")) {
      replace(body, req.serverAddress)
      .then(newBody => {
        osend.call(this, newBody);
      })
      .catch(err => {
        next(err);
      });
    } else {
      return osend.call(this, body);
    }
  };
  next();
}

module.exports = replaceImports;