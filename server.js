const express = require('express');

const app = express();
const PORT = 3000;

app.listen(PORT, (err) => {
  if (!err) {
    console.log(`Server started on: ${PORT}`);
  } else {
    console.log(`Error started server: ${err}`);
  }
});

app.use(express.static("public"));