const express = require('express');
const { controller, validateBody } = require('../middleware'); 
const { body } = require('express-validator');
const COUNTIES = require('./counties');
const { UserRepository } = require('../database');
const { UserService } = require('../services');

const NAME_PATTERN = /^[a-zA-Z0-9]+$/;

const ADDRESS_LINE_PATTERN = /^[a-zA-Z0-9 .'\-#@%&]+$/;
const ADDRESS_LINE_MAX_LENGTH = 250;

const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

const PHONE_PATTERN = /^(\d{3})\-(\d{3})\-(\d{4})$/;

const router = express.Router();

router.use(express.urlencoded({extended: false}));
router.use(express.json());

function validateName(fieldName) {
  return body(fieldName)
    .notEmpty().withMessage("Cannot be empty")
    .isLength({ min: 1, max: UserRepository.maxNameLength() }).withMessage("Invalid length")
    .matches(NAME_PATTERN).withMessage("Name must be alphanumeric");
}

function validateAddressLine(fieldName, isOptional) {
  let chain = body(fieldName);
  if (isOptional) {
    chain = chain.optional();
  }
  return chain
    .notEmpty().withMessage("Cannot be empty")
    .isLength({ min: 1, max: ADDRESS_LINE_MAX_LENGTH }).withMessage("Invalid length")
    .matches(ADDRESS_LINE_PATTERN).withMessage("Invalid address format");
}

router.post('/user/register',
  validateName('firstName'),
  validateName('lastName'),
  body('email').isEmail().withMessage("Expected valid email address"),
  body('phoneNumber').notEmpty().withMessage("Cannot be empty")
    .matches(PHONE_PATTERN).withMessage("Invalid phone format"),
  body('state')
    .notEmpty().withMessage("Cannot be empty")
    .isIn(UserRepository.validStates()).withMessage("Unknown state"),
  body('county')
    .notEmpty().withMessage("Cannot be empty")
    .custom((value, { req }) => {
      const state = req.body.state;
      if (!state) {
        // The state does not exist so cannot really check properly.
        return true;
      }
      const countyList = COUNTIES[state];
      if (!countyList) {
        // The user did not provide a valid state so cannot really check properly.
        return true;
      }
      // TODO: Consider improving performance by having these be sets instead.
      return countyList.includes(value);
    }).withMessage("Unknown county"),
  validateAddressLine('addressLine1'),
  validateAddressLine('addressLine2', true),
  body('zipCode').notEmpty().withMessage("Cannot be empty")
    .isInt({ min: 0, max: 99999 }).withMessage("Expected valid integer range"),
  body('password').notEmpty().withMessage("Cannot be empty")
    .isLength({ min: 1, max: UserRepository.maxPasswordLength() }).withMessage("Invalid length")
    .matches(PASSWORD_PATTERN).withMessage("Invalid format"),

  validateBody,
  controller(async (req, res) => {
    await UserService.register(req.body);
    res.send();
}));

router.post('/user/login',
  body('email').isEmail().withMessage("Expected valid email address"),
  body('password').notEmpty().withMessage("Cannot be empty")
    .isLength({ min: 0, max: UserRepository.maxPasswordLength() }).withMessage("Invalid length"),

  validateBody,
  controller(async (req, res) => {
    await UserService.login(req.body.email, req.body.password, req.session);
    res.send();
  })
)

module.exports = router;