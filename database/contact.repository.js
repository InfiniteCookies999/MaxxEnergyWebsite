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

  //connects to the database
  async initialize() {
    const conn = await getDBConnection();
    
    //Makes the table only if it doesn't exist 
    await conn.query(`CREATE TABLE IF NOT EXISTS ContactMessage (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(${this.maxNameLength}) NOT NULL,
      lastName VARCHAR(${this.maxNameLength}) NOT NULL,
      email VARCHAR(320) NOT NULL,
      phone CHAR(12), 
      message VARCHAR(${this.maxMessageLength}) NOT NULL
    )`);
  }

  //inserts message into contact message
  async insertContactMessage(contactMessage) {
    const conn = await getDBConnection();
    await conn.query('INSERT INTO ContactMessage SET ?', {
      firstName: contactMessage.firstName,
      lastName: contactMessage.lastName,
      email: contactMessage.email,
      phone: contactMessage.phone,
      message: contactMessage.message
    });
  }

  async getPageOfContactMessages(pageNumber, pageSize, emailSearch) {
    const conn = await getDBConnection();
    
    
    const [ messages ] = await conn.query(`SELECT * FROM ContactMessage
      WHERE email LIKE ?
      ORDER BY id ASC
      LIMIT ? OFFSET ?
      `,
      [ `%${emailSearch}%`, pageSize, pageNumber * pageSize ]);

    return messages;
  }

  async totalContactMessages(emailSearch) {
    const conn = await getDBConnection();

    const [result] = await conn.query(`SELECT COUNT(*) AS total FROM ContactMessage
      WHERE email LIKE ?`, [ `%${emailSearch}%` ]);

    return result[0].total;
  }
}

module.exports = {
  ContactRepository: new ContactRepository(),
  ContactMessage
};
