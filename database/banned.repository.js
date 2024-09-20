const getDBConnection = require('./connection');

class BannedRepository {

  async initialize() {
    const conn = await getDBConnection();

    await conn.query(`CREATE TABLE IF NOT EXISTS BannedUser (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      ip VARCHAR(100),
      userId INT,
      email VARCHAR(320),

      CONSTRAINT fk_bannedUser_userId
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )`);
  }

  async getBannedIps() {
    const conn = await getDBConnection();

    const [ results ] = await conn.query(`SELECT ip FROM BannedUser`);
    if (results.length === 0) {
      return [];
    }

    return results.map(r => r.ip);
  }

  async getBannedEmails() {
    const conn = await getDBConnection();

    const [ results ] = await conn.query(`SELECT email FROM BannedUser`);
    if (results.length === 0) {
      return [];
    }

    return results.map(r => r.email);
  }

  async getBannedUserIds() {
    const conn = await getDBConnection();

    const [ results ] = await conn.query(`SELECT userId FROM BannedUser`);
    if (results.length === 0) {
      return [];
    }

    return results.map(r => r.userId);
  }

  getSearchFieldsWhereClause(emailSearch, ipSearch) {
    
    const checkValue = (searchValue) => {
      return searchValue !== undefined && searchValue !== '';
    };

    let clause = '';
    
    let searchValues = [];
    if (checkValue(emailSearch) || checkValue(ipSearch)) {
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
    addSearch(ipSearch, 'ip');

    return [ clause, searchValues ];
  }

  async getPageOfBans(pageNumber, pageSize, emailSearch, ipSearch) {
    const conn = await getDBConnection();
    
    let [ whereClause, searchValues ] = this.getSearchFieldsWhereClause(emailSearch, ipSearch);
    
    let sql = `SELECT * FROM BannedUser ${whereClause}
               ORDER BY id ASC
               LIMIT ? OFFSET ?`;
    
    const [ messages ] = await conn.query(sql,
      [ ...searchValues, pageSize, pageNumber * pageSize ]);

    return messages;
  }

  async totalBans(emailSearch, ipSearch) {
    const conn = await getDBConnection();

    let [ whereClause, searchValues ] = this.getSearchFieldsWhereClause(emailSearch, ipSearch);

    let sql = `SELECT COUNT(*) AS total FROM BannedUser ${whereClause}`;
    const [result] = await conn.query(sql, searchValues);

    return result[0].total;
  }
};

module.exports = new BannedRepository();