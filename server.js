const express = require('express');
const { userRouter, staticRouter } = require('./routes');

const app = express();
const PORT = 3000;

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
