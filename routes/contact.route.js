const express = require('express');
const { body } = require('express-validator');
const { validateBody } = require('../middleware'); 
const ContactService = require('../services/contact.service');

const PHONE_PATTERN = /^(\d{3})\-(\d{3})\-(\d{4})$/;

const router = express.Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.post('/submit',
  body('firstName').notEmpty().withMessage("First name cannot be empty")
    .isLength({ max: 50 }).withMessage("First name must be less than 50 characters"),
  body('lastName').notEmpty().withMessage("Last name cannot be empty")
    .isLength({ max: 50 }).withMessage("Last name must be less than 50 characters"),
  body('email').isEmail().withMessage("Expected a valid email address"),
  body('phone').optional()
    .matches(PHONE_PATTERN).withMessage("Invalid phone format"),
  body('message').notEmpty().withMessage("Message cannot be empty")
    .isLength({ max: 500 }).withMessage("Message must be less than 500 characters"),

  validateBody, // Middleware to validate request body
  async (req, res) => {
    try {
      await ContactService.addContact(req.body); // Business logic to add the contact
      res.redirect('/contact'); // Redirects back to the contact page
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
