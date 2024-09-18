const express = require('express');
const { controller, validateLoggedIn, validateBody } = require('../middleware');
const { UserService, EmailService } = require('../services');
const { UserRoleRepository } = require('../database');
const { body } = require('express-validator');

const EMAIL_PATTERN  = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const router = express.Router();

router.use(express.urlencoded({extended: false}));
router.use(express.json());

router.post('/send-email',
  body('emails').notEmpty().withMessage("emails cannot be empty")
    .custom((emails) => {
      if (!emails.every(email => typeof email === 'string' && EMAIL_PATTERN.test(email))) {
        return false;
      }
      return true;
    }),
  body('subject').notEmpty().withMessage("subject cannot be empty")
    .isString().withMessage("subject must be a string"),
  body('body').notEmpty().withMessage("body cannot be empty")
    .isString().withMessage("body must be a string!"),
  
  validateBody,
  validateLoggedIn,
  controller(async (req, res) => {
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }
    
    for (const email of req.body.emails) {
      EmailService.send({
        to: email,
        subject: req.body.subject,
        text: req.body.body
      });
    }

    res.send();
}));

module.exports = router;