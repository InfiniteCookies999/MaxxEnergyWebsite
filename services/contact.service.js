const { ContactRepository, ContactMessage } = require('../database');

class ContactService {

  async saveContactMessage(dto) {
    const { firstName, lastName, email, phone, message } = dto;

    // Create a new ContactMessage object
    const contactMessage = new ContactMessage(null, firstName, lastName, email, phone, message);

    // Insert the contact message into the database
    await ContactRepository.insertContactMessage(contactMessage);
  }

  async deleteContactMessage(messageId) {
    await ContactRepository.deleteContactMessageById(messageId);
  }
}

module.exports = new ContactService();
