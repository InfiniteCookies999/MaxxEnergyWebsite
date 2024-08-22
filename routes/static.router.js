const express = require('express');
const path = require('path');
const fs = require('fs');
const { HttpError } = require('../middleware');
const config = require('../config');


const router = express.Router();

if (config.REROUTE_PATH) {
  
  // Manually serving html files to fixup hrefs.
  router.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      let readFile = '';
      if (req.path === '/') {
        readFile = 'index';
      } else {
        readFile = req.path.startsWith('/') ? req.path : req.path.substring(1);
      }
      if (!readFile.includes('.')) {
        readFile = readFile + '.html';
      }

      const filePath = path.join(__dirname + "/../", 'public', readFile);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return next(err);
        }
        data = data.replaceAll(/href="((?!http).*)"/g, (_, p1) => {
          const slash = p1.startsWith('/') ? '' : '/';
          return `href="/${config.REROUTE_PATH}${slash}${p1}"`;
        });
        res.send(data);
      });
    } else {
      next();
    }
  });
} else {
  router.use(express.static("public", { extensions: ['html'] }));
}

//router.use(express.static("public", { extensions: ['html'] }));

module.exports = router;