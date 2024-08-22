const express = require('express');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const config = require('../config');
const { HttpError } = require('../middleware');


const router = express.Router();

if (config.REROUTE_PATH) {
  
  // Manually serving static files to fix routing.
  router.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      let readPath = '';
      if (req.path === '/') {
        readPath = 'index';
      } else {
        readPath = req.path.startsWith('/') ? req.path : req.path.substring(1);
      }
      const extention = path.extname(readPath).toLowerCase();
      let mimeType = '';
      if (extention === '') {
        readPath = readPath + '.html';
        mimeType = 'text/html';
      } else {
        mimeType = mime.lookup(extention) || 'text/html';
      }

      const filePath = path.join(__dirname + "/../", 'public', readPath);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return next(new HttpError(`could not find file ${filePath}`, 404));
        }
        data = data.replaceAll(/href=["']((?!http).*)["']/g, (_, p1) => {
          const slash = p1.startsWith('/') ? '' : '/';
          return `href="/${config.REROUTE_PATH}${slash}${p1}"`;
        });
        res.setHeader('Content-Type', mimeType);
        res.send(data);
      });
    } else {
      next();
    }
  });
} else {
  router.use(express.static("public", { extensions: ['html'] }));
}

module.exports = router;