const express = require('express');
const { controller } = require('../middleware');

const router = express.Router();

router.use(express.json());

router.get('/user/register',
  controller((req, res) => {
    res.json({ "hello": "world" });
}));

module.exports = router;