const getDBConnection = require('./connection');
const User = require('./user.model');

class UserRepository {

  maxNameLength() {
    return 40;
  }

  maxAddressLineLength() {
    return 250;
  }

  maxPasswordLength() {
    return 100;
  }

  validStates() {
    return [
      'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM',
      'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA',
      'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV',
      'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW',
      'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA',
      'WA', 'WV', 'WI', 'WY'
    ];
  }

  async initialize() {
    
    const conn = await getDBConnection();
    const enumStates = this.validStates()
      .map((s) => "'" + s + "'").join();

    // NOTE: Password does not use the maxPasswordLength here because it
    // is a hashed version that gets stored in the database and not the
    // length of the raw passwords the user sends.
    await conn.query(`CREATE TABLE IF NOT EXISTS user (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(${this.maxNameLength()}) NOT NULL,
      lastName VARCHAR(${this.maxNameLength()}) NOT NULL,
      email VARCHAR(320) NOT NULL,
      phone CHAR(12) NOT NULL,
      state ENUM(${enumStates}) NOT NULL,
      county VARCHAR(100) NOT NULL,
      addressLine1 VARCHAR(${this.maxAddressLineLength()}) NOT NULL,
      addressLine2 VARCHAR(${this.maxAddressLineLength()}),
      zipCode MEDIUMINT NOT NULL,
      password VARCHAR(120) NOT NULL,
      joinDate DATE NOT NULL,
      
      UNIQUE (email)
      )`);
  }

  async saveUser(user) {
    const conn = await getDBConnection();

    delete user.id; // Do not want to insert user's id into the table.
    await conn.execute(`INSERT INTO user (firstName, lastName, email, phone, state, county,
                                          addressLine1, addressLine2, zipCode, password, joinDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      Object.values(user));
    
    return await this.getUserByEmail(user.email);
  }

  async doesUserExistByEmail(email) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute(`SELECT id FROM user WHERE email=?`, [ email ]);
    return results.length > 0;
  }

  async getUserById(userId) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute(`SELECT * FROM user WHERE id=?`, [ userId ]);
    if (results.length === 0) {
      return null;
    }

    const user = new User(...Object.values(results[0]));
    return user;
  }

  /*async updateUsersName(firstName, lastName) {
    const conn = await getDBConnection();

    await conn.execute(`UPDATE user SET firstName=?, lastName=? WHERE id=?`,
      []
    )
  }*/

  async getUserByEmail(email) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute(`SELECT * FROM user WHERE email=?`, [ email ]);
    if (results.length === 0) {
      return null;
    }

    const user = new User(...Object.values(results[0]));
    return user;
  }

}

module.exports = new UserRepository();