const createApp = require('./create.app');
const config = require('./config');

const PORT = config.SERVER_PORT || 3000;

const app = createApp();
app.listen(PORT, (err) => {
  if (!err) {
    console.log(`Server started on: ${PORT}`);
  } else {
    console.log(`Error started server: ${err}`);
  }
});
