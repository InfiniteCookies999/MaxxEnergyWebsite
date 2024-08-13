const express = require('express');
const { userRouter } = require('./routes');

const app = express();
const PORT = 3000;

app.listen(PORT, (err) => {
  if (!err) {
    console.log(`Server started on: ${PORT}`);
  } else {
    console.log(`Error started server: ${err}`);
  }
});

// TODO: Move into routing sub-folder!
app.use(express.static("public", { extensions: ['html'] }));

// Installing routes.
app.use('/api/', userRouter);
