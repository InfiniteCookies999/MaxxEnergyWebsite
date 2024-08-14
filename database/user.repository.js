const getDBConnection = require('./connection');

class User {
  constructor(firstName, lastName, email, phone, state, county,
              address_line_1, address_line_2,
              zip_code, password, joinDate) {
    this.id = 0;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.state = state;
    this.county = county;
    this.address_line_1 = address_line_1;
    this.address_line_2 = address_line_2;
    this.zip_code = zip_code;
    this.password = password;
    this.joinDate = joinDate;
  }
}

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
      first_name VARCHAR(${this.maxNameLength()}) NOT NULL,
      last_name VARCHAR(${this.maxNameLength()}) NOT NULL,
      email TEXT(320) NOT NULL,
      phone CHAR(12) NOT NULL,
      state ENUM(${enumStates}) NOT NULL,
      county VARCHAR(100) NOT NULL,
      address_line_1 VARCHAR(${this.maxAddressLineLength()}) NOT NULL,
      address_line_2 VARCHAR(${this.maxAddressLineLength()}),
      zip_code MEDIUMINT NOT NULL,
      password VARCHAR(120) NOT NULL,
      join_date DATE NOT NULL
      )`);
  }

  async create(user) {
    const conn = await getDBConnection();

    delete user.id; // Do not want to insert user's id into the table.
    await conn.execute(`INSERT INTO user (first_name, last_name, email, phone, state, county,
                                          address_line_1, address_line_2, zip_code, password, join_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      Object.values(user));
  }
}

module.exports = {
  UserRepository: new UserRepository(),
  User
}