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

  validProfilePicMimetypes() {
    return [ "image/png", "image/jpg", "image/jpeg", "image/webp", "image/avif" ];
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

      // Adding a column for the profile picture if it does not exist.
      {
        const [rows] = await conn.execute(
          `SELECT * FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = ? AND COLUMN_NAME = ?`,
           ["user", "profilePicFile"]
        );
  
        if (rows.length === 0) {
          await conn.execute(`ALTER TABLE user ADD COLUMN profilePicFile CHAR(100)`);
        }
      }
      // Adding a column for if the user's email is verified if it does not exist.
      {
        const [rows] = await conn.execute(
          `SELECT * FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = ? AND COLUMN_NAME = ?`,
           ["user", "emailVerified"]
        );
  
        if (rows.length === 0) {
          await conn.execute(`ALTER TABLE user ADD COLUMN emailVerified BOOLEAN DEFAULT FALSE`);
        }
      }
  }

  async saveUser(user) {
    const conn = await getDBConnection();

    // Removing fields that do not get saved.
    delete user.id;
    delete user.profilePicFile;
    delete user.emailVerified;
    await conn.execute(`INSERT INTO user (firstName, lastName, email, phone, state, county,
                                          addressLine1, addressLine2, zipCode, password,
                                          joinDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      Object.values(user));
    
    return await this.getUserByEmail(user.email);
  }

  async doesUserExistByEmail(email) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute(`SELECT id FROM user WHERE email COLLATE utf8mb4_general_ci=?`,
      [ email ]);
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

  async updateUsersName(userId, firstName, lastName) {
    const conn = await getDBConnection();

    await conn.execute(`UPDATE user SET firstName=?, lastName=? WHERE id=?`,
      [firstName, lastName, userId]
    );
  }

  async updateUsersEmail(userId, email, emailVerified) {
    const conn = await getDBConnection();

    await conn.execute(`UPDATE user SET email=?, emailVerified=? WHERE id=?`,
      [email, emailVerified, userId]
    );
  }

  async updateUsersPhone(userId, phone) {
    const conn = await getDBConnection();

    await conn.execute(`UPDATE user SET phone=? WHERE id=?`,
      [phone, userId]
    );
  }

  async updateUsersAddress(userId, state, county, addressLine1, addressLine2, zipCode) {
    const conn = await getDBConnection();

    let values = [state, county, addressLine1, addressLine2 || null, zipCode, userId]; 
    
    await conn.execute(`UPDATE user SET
        state=?,
        county=?,
        addressLine1=?,
        addressLine2=?,
        zipCode=?
      WHERE id=?`,
      values);
  }

  async updatePassword(userId, newPassword) {
    const conn = await getDBConnection();

    await conn.execute(`UPDATE user SET password=? WHERE id=?`,
      [newPassword, userId]
    );
  }

  async updateEmailVerified(userId, isVerified) {
    const conn = await getDBConnection();

    await conn.execute(`UPDATE user SET emailVerified=? WHERE id=?`,
      [isVerified ? 1 : 0, userId]
    );
  }

  async updateProfilePic(userId, profilePicFile) {
    const conn = await getDBConnection();

    await conn.execute(`UPDATE user SET profilePicFile=? WHERE id=?`,
      [profilePicFile, userId]
    );
  }

  async getUserByEmail(email) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute(`SELECT * FROM user WHERE email=?`, [ email ]);
    if (results.length === 0) {
      return null;
    }

    const user = new User(...Object.values(results[0]));
    return user;
  }

  getSearchFieldsWhereClause(emailSearch, firstNameSearch, lastNameSearch,
                             phoneSearch, stateSearch, countySearch, idSearch, 
                             zipcodeSearch, fullAddressSearch) {
    
    const checkValue = (searchValue) => {
      return searchValue !== undefined && searchValue !== '';
    };

    let clause = '';
    
    let searchValues = [];
    if (checkValue(emailSearch) || checkValue(firstNameSearch) || checkValue(lastNameSearch) ||
        checkValue(phoneSearch) || checkValue(stateSearch) || checkValue(countySearch) ||
        checkValue(idSearch) || checkValue(zipcodeSearch) || checkValue(fullAddressSearch)) {
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
    addSearch(phoneSearch, 'phone');
    addSearch(stateSearch, 'state');
    addSearch(countySearch, 'county');
    addSearch(idSearch, 'id');
    addSearch(zipcodeSearch, 'zipCode');
    if (checkValue(fullAddressSearch)) {
      if (alreadyHasSearch) {
        clause += 'AND ';
      }
      clause += `CONCAT(addressLine1,
                        ' ',
                        IF(addressLine2 IS NOT NULL AND addressLine2 != '',
                           CONCAT(addressLine2, ' '),
                           ''),
                        REPLACE(county, '-', ' '),
                        ' ',
                        state,
                        ', ',
                        zipCode)
                    LIKE ?`;
      clause += " ";
      searchValues.push(`%${fullAddressSearch}%`);
      alreadyHasSearch = true;
    }

    return [ clause, searchValues ];
  }

  async getPageOfUsers(pageNumber, pageSize,
                       emailSearch, firstNameSearch, lastNameSearch,
                       phoneSearch, stateSearch, countySearch, idSearch,
                       zipcodeSearch, fullAddressSearch) {
    const conn = await getDBConnection();
    
    let [ whereClause, searchValues ] = this.getSearchFieldsWhereClause(
      emailSearch, firstNameSearch, lastNameSearch,
      phoneSearch, stateSearch, countySearch, idSearch, zipcodeSearch,
      fullAddressSearch);
    
    let sql = `SELECT * FROM user ${whereClause}
               ORDER BY id ASC
               LIMIT ? OFFSET ?`;
    
    const [ users ] = await conn.query(sql,
      [ ...searchValues, pageSize, pageNumber * pageSize ]);

    return users;
  }

  async totalUsers(emailSearch, firstNameSearch, lastNameSearch,
                   phoneSearch, stateSearch, countySearch, idSearch,
                   zipcodeSearch, fullAddressSearch) {
    const conn = await getDBConnection();

    let [ whereClause, searchValues ] = this.getSearchFieldsWhereClause(
      emailSearch, firstNameSearch, lastNameSearch,
      phoneSearch, stateSearch, countySearch, idSearch, zipcodeSearch,
      fullAddressSearch);
    
    let sql = `SELECT COUNT(*) AS total FROM user ${whereClause}`;
    const [result] = await conn.query(sql, searchValues);

    return result[0].total;
  }

  async totalVerifiedUsers() {
    const conn = await getDBConnection();

    const [result] = await conn.query(`SELECT COUNT(*) AS total FROM user
      WHERE emailVerified=1`);

    return result[0].total;
  }

  async deleteUserById(userId) {
    const conn = await getDBConnection();

    await conn.query(`DELETE FROM user WHERE id=?`,
      [userId]);
  }

  async getAllEmails() {
    const conn = await getDBConnection();

    const [result] = await conn.query(`SELECT email FROM user`);

    return result;
  }
}

module.exports = new UserRepository();