const express = require('express');
const { ContactRepository, UserRoleRepository } = require('../database');
const { validateLoggedIn, HttpError, controller, validateBody } = require('../middleware');
const { UserService } = require('../services');
const { query, body } = require('express-validator');
const { ContactService } = require('../services');

const PHONE_PATTERN = /^(\d{3})\-(\d{3})\-(\d{4})$/;

const router = express.Router();

function validateName(name) {
  return body(name).notEmpty().withMessage("name cannot be empty")
    .isLength({ min: 1, max: ContactRepository.maxNameLength() });
}

// Route to handle contact form submissions
router.post('/contact/submit',
  validateName('firstName'),
  validateName('lastName'),
  body('email').isEmail().withMessage("Expected valid email address"),
  body('phone').notEmpty().withMessage("Phone cannot be empty")
    .matches(PHONE_PATTERN).withMessage("Expected valid phone number"),
  body('message').notEmpty().withMessage("Message cannot be empty")
    .isLength({ min: 1, max: ContactRepository.maxMessageLength() }),

  validateBody,
  
  controller(async (req, res) => {

  await ContactService.saveContactMessage(req.body);

  // Send a success response back to the client
  res.status(200).json({ status: 'success', message: 'Message saved successfully!' });
}));

router.get('/contact/messages',
  query('page').notEmpty().withMessage("The page cannot be empty"),
  query('email').optional(),
  query('name').optional(),
  query('id').optional(),
  query("messageText").optional(),
  query('phone').optional(),
  validateBody,

  validateLoggedIn,
  controller(async (req, res) => {
    
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    const page = req.query.page;
    const emailSearch = req.query.email || '';
    const nameSearch = req.query.name || '';
    const idSearch = req.query.id || '';
    const messageTextSearch = req.query.messageText || '';
    const phoneSearch = req.query.phone || '';
    
    const nameParts = nameSearch.trim().split(" ");
    const firstName = nameParts[0]?.trim() || '';
    const lastName = nameParts[1]?.trim() || '';

    const pageSize = 12;
    let messages = await ContactRepository.getPageOfContactMessages(page, pageSize,
      emailSearch, firstName, lastName, idSearch, messageTextSearch, phoneSearch);
    // Also search for if the only provide last name.
    if (firstName !== '' && lastName === '') {
      const messages2 = await ContactRepository.getPageOfContactMessages(page, pageSize,
        emailSearch, '', firstName, idSearch, messageTextSearch, phoneSearch);
      messages = messages.concat(messages2);
    }
    
    let total = await ContactRepository.totalContactMessages(
      emailSearch, firstName, lastName, idSearch, messageTextSearch, phoneSearch);
    if (firstName !== '' && lastName === '') {
      const total1 = await ContactRepository.totalContactMessages(
        emailSearch, '', firstName, idSearch, messageTextSearch, phoneSearch);
      total += total1;
    }

    res.json({
      messages,
      totalPages: Math.ceil(total / pageSize)
    });
}));

router.delete('/contact',
  body('messageIds').notEmpty().withMessage("messageIds cannot be empty")
    .isArray({ min: 1 }).withMessage("Expected an array")
    .bail()
    .custom((arr) => {
      return arr.every(e => Number.isInteger(e));
    }).withMessage("All elements must be integers"),    
  validateBody,

  validateLoggedIn,
  controller(async (req, res) => {
    
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    const messageIds = req.body.messageIds;

    for (const messageId of messageIds) {
      await ContactService.deleteContactMessage(messageId);
    }

    res.send();
}));

module.exports = router;
