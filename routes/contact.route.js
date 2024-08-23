const express = require('express');
const { ContactRepository, ContactMessage } = require('../database');

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

module.exports = router;
