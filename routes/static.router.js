const express = require('express');

const router = express.Router();

router.use(express.static("public", { extensions: ['html'] }));

module.exports = router;