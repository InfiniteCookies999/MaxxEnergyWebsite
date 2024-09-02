const express = require('express');
const { ContactRepository, ContactMessage, UserRoleRepository } = require('../database');
const { validateLoggedIn, HttpError, controller } = require('../middleware');
const { UserService } = require('../services');

const router = express.Router();

// Route to handle contact form submissions
router.post('/submit', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    // Create a new ContactMessage object
    const contactMessage = new ContactMessage(null, firstName, lastName, email, phone, message);

    // Insert the contact message into the database
    await ContactRepository.insertContactMessage(contactMessage);

    // Send a success response back to the client
    res.status(200).json({ status: 'success', message: 'Message saved successfully!' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ status: 'error', message: 'There was an error saving your message. Please try again later.' });
  }
});

router.get('/pages/:page',
  validateLoggedIn,

  controller(async (req, res) => {
    
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    const pageNumber = req.params.page;

    const pageSize = 12;
    const messages = await ContactRepository.getPageOfContactMessages(pageNumber, pageSize);
    const total = await ContactRepository.totalContactMessages();

    res.json({
      messages,
      totalPages: Math.ceil(total / pageSize)
    });
}));

module.exports = router;
