const getDBConnection = require('./connection');

class StoreRepository {
  static async initialize() {
    const conn = await getDBConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS store (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT DEFAULT 0,
        image VARCHAR(500) NOT NULL
      )
    `);
  }

  static async getAllItems() {
    const conn = await getDBConnection();
    const [results] = await conn.query('SELECT * FROM store');
    return results;
  }
}

module.exports = StoreRepository;
