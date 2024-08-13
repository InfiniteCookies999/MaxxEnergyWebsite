const express = require('express');
const { controller, validateBody } = require('../middleware'); 
const { body } = require('express-validator');
const COUNTIES = require('./counties');

const NAME_PATTERN = /^[a-zA-Z0-9]+$/;
const NAME_MAX_LENGTH = 40;

const ADDRESS_LINE_PATTERN = /^[a-zA-Z0-9 .'\-#@%&]+$/;
const ADDRESS_LINE_MAX_LENGTH = 250;

const MAX_PASSWORD_LENGTH = 100;
const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

const VALID_STATES = [
  'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM',
  'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA',
  'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV',
  'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW',
  'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA',
  'WA', 'WV', 'WI', 'WY'
];

const router = express.Router();

router.use(express.json());

function validateName(fieldName) {
  return body(fieldName)
    .notEmpty().withMessage("Cannot be empty")
    .isLength({ min: 1, max: NAME_MAX_LENGTH }).withMessage("Invalid length")
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
  body('state')
    .notEmpty().withMessage("Cannot be empty")
    .isIn(VALID_STATES).withMessage("Unknown state"),
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
    .isLength({ min: 1, max: MAX_PASSWORD_LENGTH }).withMessage("Invalid length")
    .matches(PASSWORD_PATTERN).withMessage("Invalid format"),

  validateBody,
  controller((req, res) => {
    res.send("This is the response!");
}));

module.exports = router;