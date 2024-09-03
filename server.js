const createApp = require('./create.app');
const config = require('./config');
const {
  getDBConnection,
  UserRepository,
  ContactRepository,
  EmailVerifyRepository,
  PasswordResetRepository,
  UserRoleRepository,
  ContactMessage
} = require('./database');
const { EmailService } = require('./services');

(async () => {
  await getDBConnection();
  
  await UserRepository.initialize();
  await ContactRepository.initialize();
  await EmailVerifyRepository.initialize();
  await PasswordResetRepository.initialize();
  await UserRoleRepository.initialize();
  await EmailService.initialize();

  if (config.SHOULD_MOCK_CONTACT_MESSAGES === "true") {
    const selection = [
      { firstName: "Susan", lastName: "Smith", email: "susan@gmail.com", phone: "452-522-7321" },
      { firstName: "John", lastName: "Doe", email: "john.doe@gmail.com", phone: "123-456-7890" },
      { firstName: "Jane", lastName: "Doe", email: "jane.doe@gmail.com", phone: "234-567-8901" },
      { firstName: "Alice", lastName: "Johnson", email: "alice.johnson@gmail.com", phone: "345-678-9012" },
      { firstName: "Bob", lastName: "Williams", email: "bob.williams@gmail.com", phone: "456-789-0123" }
    ]; 
    
    for (let i = 0; i <= 100; i++) {
      const selected = selection[i % selection.length];
      await ContactRepository.insertContactMessage(new ContactMessage(
        null,
        selected.firstName,
        selected.lastName,
        selected.email,
        selected.phone,
        `This is a mocked contact message to demonstrate that this works.
         This is the ${i} mocked message!`
      ));
    }
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
