const getDBConnection = require('./connection');

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

  async create() {
    
    const conn = await getDBConnection();
    const enumStates = this.validStates()
      .map((s) => "'" + s + "'").join();

    // NOTE: Password does not use the maxPasswordLength here because it
    // is a hashed version that gets stored in the database and not the
    // length of the raw passwords the user sends.
    conn.query(`CREATE TABLE IF NOT EXISTS user (
      first_name CHAR(${this.maxNameLength()}),
      last_name CHAR(${this.maxNameLength()}),
      email TEXT(320),
      phone CHAR(12),
      state CHAR(2),
      county CHAR(100),
      address_line_1 CHAR(${this.maxAddressLineLength()}),
      address_line_2 CHAR(${this.maxAddressLineLength()}),
      zip_code ENUM(${enumStates}),
      password CHAR(120),
      join_date DATE
      )`);
  }
}

module.exports = new UserRepository();