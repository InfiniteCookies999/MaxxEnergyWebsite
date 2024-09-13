const bcrypt = require('bcryptjs');
const createApp = require('./create.app');
const config = require('./config');
const {
  getDBConnection,
  UserRepository,
  ContactRepository,
  EmailVerifyRepository,
  PasswordResetRepository,
  UserRoleRepository,
  StoreRepository  // Import StoreRepository
} = require('./database');
const { EmailService } = require('./services');

async function mockDatabase() {
  const conn = await getDBConnection();

  const messageSelection = [
    { firstName: "Susan", lastName: "Smith", email: "susan@gmail.com", phone: "452-522-7321" },
    { firstName: "John", lastName: "Doe", email: "john.doe@gmail.com", phone: "123-456-7890" },
    { firstName: "Jane", lastName: "Doe", email: "jane.doe@gmail.com", phone: "234-567-8901" },
    { firstName: "Alice", lastName: "Johnson", email: "alice.johnson@gmail.com", phone: "345-678-9012" },
    { firstName: "Bob", lastName: "Williams", email: "bob.williams@gmail.com", phone: "456-789-0123" },
  ];

  const [messageResults] = await conn.query(`SELECT * FROM ContactMessage WHERE email=?`, [messageSelection[0].email]);
  if (messageResults.length === 0) {
    const bulkMessages = [];
    for (let i = 0; i <= 100; i++) {
      messageSelection.forEach(row => {
        bulkMessages.push([
          row.firstName, row.lastName, row.email, row.phone,
          `This is a mocked contact message to demonstrate that this works.
           This is the ${i} mocked message!`
        ]);
      });
    }

    const placeholders = bulkMessages.map(() => '(?, ?, ?, ?, ?)').join(', ');
    await conn.query(`INSERT INTO ContactMessage
      (firstName, lastName, email, phone, message)
      VALUES ${placeholders}
      `, bulkMessages.flat());
  }

  const userSelection = [
    {
      firstName: "Susan",
      lastName: "Smith",
      email: "susan@gmail.com",
      phone: "452-522-7321",
      state: "VA",
      county: "Fairfax-County",
      addressLine1: "123 Elm St",
      zipCode: "23456",
      password: await bcrypt.hash("securepassword1", 10)
    },
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@gmail.com",
      phone: "123-456-7890",
      state: "NY",
      county: "Kings-County",
      addressLine1: "456 Maple Ave",
      zipCode: "67890",
      password: await bcrypt.hash("securepassword2", 10)
    },
    {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@gmail.com",
      phone: "234-567-8901",
      state: "LA",
      county: "Orleans-Parish",
      addressLine1: "789 Oak Dr",
      zipCode: "34567",
      password: await bcrypt.hash("securepassword3", 10)
    },
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@gmail.com",
      phone: "345-678-9012",
      state: "CA",
      county: "Los-Angeles-County",
      addressLine1: "101 Pine St",
      zipCode: "45678",
      password: await bcrypt.hash("securepassword4", 10)
    },
    {
      firstName: "Bob",
      lastName: "Williams",
      email: "bob.williams@gmail.com",
      phone: "456-789-0123",
      state: "IL",
      county: "Cook-County",
      addressLine1: "202 Birch Rd",
      zipCode: "56789",
      password: await bcrypt.hash("securepassword5", 10)
    },
  ];

  const [userResults] = await conn.query(`SELECT * FROM user WHERE email=?`, [userSelection[0].email]);
  if (userResults.length === 0) {
    const bulkUsers = [];
    for (let i = 0; i <= 50; i++) {
      userSelection.forEach(row => {
        let email = row.email;
        if (i !== 0) {
          const idx = email.indexOf('@');
          email = email.substring(0, idx) + `${i}` + email.substring(idx);
        }
        bulkUsers.push([
          row.firstName, row.lastName, email, row.phone,
          row.state, row.county, row.addressLine1, row.zipCode,
          row.password, new Date(), 0
        ]);
      });
    }

    const placeholders = bulkUsers.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    await conn.query(`INSERT INTO user
      (firstName, lastName, email, phone, state, county,
       addressLine1, zipCode, password, joinDate, emailVerified)
      VALUES ${placeholders}
      `, bulkUsers.flat());
  }
}

(async () => {
  await getDBConnection();
  
  await UserRepository.initialize();
  await ContactRepository.initialize();
  await EmailVerifyRepository.initialize();
  await PasswordResetRepository.initialize();
  await UserRoleRepository.initialize();
  await StoreRepository.initialize();  // Initialize StoreRepository

  await EmailService.initialize();

  if (config.SHOULD_MOCK_DATABASE === "true") {
    mockDatabase();
  }
  
  const port = config.SERVER_PORT || 3000;

  const app = createApp();
  app.listen(port, (err) => {
    if (!err) {
      console.log(`Server started on: ${port}`);
    } else {
      console.log(`Error starting server: ${err}`);
    }
  });

})();
