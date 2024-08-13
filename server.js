const createApp = require('./create.app');

const PORT = 3000 || config.SERVER_PORT;

const app = createApp();
app.listen(PORT, (err) => {
  if (!err) {
    console.log(`Server started on: ${PORT}`);
  } else {
    console.log(`Error started server: ${err}`);
  }
});
