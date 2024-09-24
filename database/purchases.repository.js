const getDBConnection = require('./connection');

class PurchasesRepository {
  static async initialize() {
    const conn = await getDBConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
        userId INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        purchaseDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user(id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
        purchaseId INT NOT NULL,
        itemId INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (purchaseId) REFERENCES purchases(id),
        FOREIGN KEY (itemId) REFERENCES store(id)
      )
    `);
  }

  static async recordPurchase(userId, total, items) {
    const conn = await getDBConnection();

    // Starts a purchase transaction when customer makes purchas
    await conn.beginTransaction();
    try {
      // Insert into the table for purchases
      const [purchaseResult] = await conn.query(
        'INSERT INTO purchases (userId, total) VALUES (?, ?)',
        [userId, total]
      );

      const purchaseId = purchaseResult.insertId;

      // Insert into purchase_items table
      for (const item of items) {
        await conn.query(
          'INSERT INTO purchase_items (purchaseId, itemId, quantity, price) VALUES (?, ?, ?, ?)',
          [purchaseId, item.id, item.quantity, (item.price / 100).toFixed(2)]
        );
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    }
  }

  static async getAllPurchases() {
    const conn = await getDBConnection();
    const [purchases] = await conn.query(`
      SELECT p.*, u.firstName, u.lastName FROM purchases p
      JOIN user u ON p.userId = u.id
      ORDER BY p.id ASC  -- Ordered by ID in ascending order
    `);

    // For each purchase the customer made get the items
    for (const purchase of purchases) {
      const [items] = await conn.query(`
        SELECT pi.*, s.name FROM purchase_items pi
        JOIN store s ON pi.itemId = s.id
        WHERE pi.purchaseId = ?
      `, [purchase.id]);

      purchase.items = items;
    }

    return purchases;
  }
}

module.exports = PurchasesRepository;
