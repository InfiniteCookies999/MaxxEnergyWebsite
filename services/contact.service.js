const { HttpError } = require('../middleware');
const { ContactRepository, ContactMessage } = require('../database');

class ContactService {

  /**
   * Adds a new contact message to the database.
    @param {Object} dto - The data transfer object containing contact details.
    @returns {Promise<ContactMessage>} The newly created contact message.
   */
  async addContact(dto) {
    // Create a new ContactMessage instance and save it to the database
    const contact = new ContactMessage(
      0, // Assuming the ID is auto-incremented by the database
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.phone || null, // Phone number is optional
      dto.message
    );

    return await ContactRepository.saveContact(contact);
  }

  /**
    Retrieves a contact message by ID.
    @param {number} id - The ID of the contact message to retrieve.
    @returns {Promise<ContactMessage>} The contact data if found.
   */
  async getContactById(id) {
    const contact = await ContactRepository.getContactById(id);
    if (!contact) {
      throw new HttpError("Contact not found", 404);
    }
    return contact;
  }

  /**
    Retrieves all contact messages.
    @returns {Promise<ContactMessage[]>} A list of all contact messages.
   */
  async getAllContacts() {
    return await ContactRepository.getAllContacts();
  }

  /**
    Deletes a contact message by ID.
    @param {number} id - The ID of the contact message to delete.
    @returns {Promise<void>}
   */
  async deleteContact(id) {
    const contact = await this.getContactById(id);
    if (!contact) {
      throw new HttpError("Contact not found", 404);
    }
    await ContactRepository.deleteContactById(id);
  }
}

module.exports = new ContactService();
