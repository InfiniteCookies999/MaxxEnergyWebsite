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
    for (let i = 0; i <= 100; i++) {
      await ContactRepository.insertContactMessage(new ContactMessage(
        null,
        "Susan",
        "Smith",
        "susan@gmail.com",
        "777-777-7777",
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
