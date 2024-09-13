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

  maxNameLength() {
    return 100;
  }

  maxMessageLength() {
    return 600;
  }

  //connects to the database
  async initialize() {
    const conn = await getDBConnection();
    
    //Makes the table only if it doesn't exist 
    await conn.query(`CREATE TABLE IF NOT EXISTS ContactMessage (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(${this.maxNameLength()}) NOT NULL,
      lastName VARCHAR(${this.maxNameLength()}) NOT NULL,
      email VARCHAR(320) NOT NULL,
      phone CHAR(12), 
      message VARCHAR(${this.maxMessageLength()}) NOT NULL
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

  getSearchFieldsWhereClause(emailSearch, firstNameSearch, lastNameSearch,
                             idSearch, messageTextSearch, phoneSearch) {
    
    const checkValue = (searchValue) => {
      return searchValue !== undefined && searchValue !== '';
    };

    let clause = '';
    
    let searchValues = [];
    if (checkValue(emailSearch) || checkValue(firstNameSearch) ||
        checkValue(lastNameSearch) || checkValue(idSearch) ||
        checkValue(messageTextSearch) || checkValue(phoneSearch)) {
          clause += "WHERE ";
    }

    let alreadyHasSearch = false;
    const addSearch = (searchValue, filedName) => {
      if (checkValue(searchValue)) {
        if (alreadyHasSearch) {
          clause += 'AND ';
        }
        clause += `${filedName} LIKE ? `;
        searchValues.push(`%${searchValue}%`);
        alreadyHasSearch = true;
      }
    };

    addSearch(emailSearch, 'email');
    addSearch(firstNameSearch, 'firstName');
    addSearch(lastNameSearch, 'lastName');
    addSearch(idSearch, 'id');
    addSearch(messageTextSearch, "message");
    addSearch(phoneSearch, "phone");

    return [ clause, searchValues ];
  }

  async getPageOfContactMessages(pageNumber, pageSize,
                                 emailSearch, firstNameSearch, lastNameSearch,
                                 idSearch, messageTextSearch, phoneSearch) {
    const conn = await getDBConnection();
    
    let [ whereClause, searchValues ] = this.getSearchFieldsWhereClause(
      emailSearch, firstNameSearch, lastNameSearch, idSearch, messageTextSearch, phoneSearch);
    
    let sql = `SELECT * FROM ContactMessage ${whereClause}
               ORDER BY id ASC
               LIMIT ? OFFSET ?`;
    
    const [ messages ] = await conn.query(sql,
      [ ...searchValues, pageSize, pageNumber * pageSize ]);

    return messages;
  }

  async totalContactMessages(emailSearch, firstNameSearch, lastNameSearch,
                             idSearch, messageTextSearch, phoneSearch) {
    const conn = await getDBConnection();

    let [ whereClause, searchValues ] = this.getSearchFieldsWhereClause(
      emailSearch, firstNameSearch, lastNameSearch, idSearch, messageTextSearch, phoneSearch);
    
    let sql = `SELECT COUNT(*) AS total FROM ContactMessage ${whereClause}`;
    const [result] = await conn.query(sql, searchValues);

    return result[0].total;
  }

  async deleteContactMessageById(messageId) {
    const conn = await getDBConnection();

    await conn.query(`DELETE FROM ContactMessage WHERE id=?`,
      [messageId]);    
  }
}

module.exports = {
  ContactRepository: new ContactRepository(),
  ContactMessage
};
