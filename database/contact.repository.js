const getDBConnection = require('./connection');

class ContactMessage {
  constructor(id, firstName, lastName, email, phone, message) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.message = message;
  }
}

class ContactRepository {
  constructor() {
    this.maxNameLength = 100;
    this.maxMessageLength = 600;
  }

  async initialize() {
    const conn = await getDBConnection();
    
    await conn.query(`CREATE TABLE IF NOT EXISTS ContactMessage (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(${this.maxNameLength}) NOT NULL,
      lastName VARCHAR(${this.maxNameLength}) NOT NULL,
      email VARCHAR(320) NOT NULL,
      phone VARCHAR(10), 
      message VARCHAR(${this.maxMessageLength}) NOT NULL
    )`);
  }
}

module.exports = {
  ContactRepository: new ContactRepository(),
  ContactMessage
};
