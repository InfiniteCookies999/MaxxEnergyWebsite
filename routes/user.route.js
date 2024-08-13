const express = require('express');
const { controller, HttpError } = require('../middleware'); 

const router = express.Router();

router.use(express.json());

router.get('/user/register',
  controller((req, res) => {
    throw new HttpError("This is my error message!", 400);
    //res.json({ "hello": "world" });
}));

module.exports = router;