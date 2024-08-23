
async function replace(req, res, next) {
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

        const body = await fs.promises.readFile(filePath + '.html', 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(replaceRoutes(body));

      } else if (fs.existsSync(filePath + '.hbs')) {
        // We have to replace at the point of send because the hbs
        // engine needs to do it's work first!
        const osend = res.send;
        res.send = function (body) {
          return osend.call(this, replaceRoutes(body));
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