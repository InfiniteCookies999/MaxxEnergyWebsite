const express = require('express');
const config = require('./config');
const { userRouter, staticRouter } = require('./routes');
const { errorHandler } = require('./middleware');

const app = express();
const PORT = 3000 || config.SERVER_PORT;

app.listen(PORT, (err) => {
  if (!err) {
    console.log(`Server started on: ${PORT}`);
  } else {
    console.log(`Error started server: ${err}`);
  }
});

// Installing routes.
app.use('/api/', userRouter);
app.use(staticRouter);

// Install middleware
app.use(errorHandler);