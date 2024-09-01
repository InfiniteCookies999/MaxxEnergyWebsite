const config = require('../config');
const fs = require('fs');
const axios = require('axios'); 
const path = require('path');
const { replaceRoutes } = require('./reroute');
const HttpError = require('./http.error');
const hbs = require('hbs'); 

async function replace(body, serverAddress, context) {
  // Find all matches
  const matches = [...body.matchAll(/<import\s*value="(.*)"><\/import>/g)];

  // Create a list of promises to handle each match.
  const replacementPromises = matches.map(async (m) => {
    const [match, p1] = m;
    let filePath = path.join(__dirname, '../public', p1);

    if (fs.existsSync(filePath + '.html')) {
      // Reading HTML file and replacing route information!
      let importBody = fs.readFileSync(filePath + '.html', 'utf8');
      // Reroute the imported body if we need to.
      if (config.REROUTE_PATH) {
        importBody = replaceRoutes(importBody);
      }
      return { match, replacement: importBody };
    } else if (fs.existsSync(filePath + '.hbs')) {
      // Render the Handlebars template with the current context
      const templatePath = filePath + '.hbs';
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = hbs.handlebars.compile(templateSource);
      const renderedTemplate = template(context); // Use current context (e.g., res.locals)

      return { match, replacement: renderedTemplate };
    } else {
      throw new HttpError("Could not find HTML or HBS file for importing", 404);
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
    // Making sure we only change HTML files!
    if (body && body.trimStart().startsWith("<!DOCTYPE html>")) {
      // Pass `res.locals` as the context to be used when rendering .hbs files
      replace(body, req.serverAddress, res.locals)
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