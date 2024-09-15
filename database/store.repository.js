const getDBConnection = require('./connection');

class StoreRepository {
  static async initialize() {
    const conn = await getDBConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS store (
        id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10) NOT NULL,
        quantity INT DEFAULT 0,
        image VARCHAR(500) NOT NULL
      )
    `);

    // Array of Objects for store
    const items = [
      { id: '1', name: 'LED Light bulb', price: 1999, description: 'Long-lasting LED that saves energy and brightens up your space.', stock: 30, image: "store-images/led-light-bulb.jpg" },
      { id: '2', name: 'Solar-Powered Charger', price: 6999, description: 'Charge your devices anywhere with solar power, perfect for on-the-go.', stock: 40, image: "store-images/solar-charger.jpg" },
      { id: '3', name: 'Solar-Powered Fan', price: 3099, description: 'Enjoy a cool breeze powered by the sun, great for outdoors and emergencies.', stock: 50, image: "store-images/solar-fan.jpg" },
      { id: '4', name: 'Reusable Smart Battery', price: 4999, description: 'Rechargeable battery for everyday use, eco-friendly and cost-effective.', stock: 45, image: "store-images/eco-battery.jpg" },
      { id: '5', name: 'Smart Plug', price: 1999, description: 'Control appliances remotely, save energy and reduce bills effortlessly.', quantity: 65, image: "store-images/smart-plug.jpg" },
      { id: '6', name: 'Reusable Water Bottle', price: 1499, description: 'Durable, insulated bottle to keep drinks hot or cold, reusable and stylish.', stock: 48, image: "store-images/water-bottle.jpg" },
    ];

    // Using a regular for loop to check and insert items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Check if the item already exists
      const [existingItem] = await conn.query(`SELECT * FROM store WHERE name = ?`, [item.name]);

      if (existingItem.length === 0) {
        await conn.query(
          `INSERT INTO store (name, description, price, quantity, image) VALUES (?, ?, ?, ?, ?)`,
          [item.name, item.description, item.price, item.quantity, item.image]
        );
      }
    }
  }

  static async getAllItems() {
    const conn = await getDBConnection();
    const [results] = await conn.query('SELECT * FROM store');
    return results;
  }
}

module.exports = StoreRepository;
