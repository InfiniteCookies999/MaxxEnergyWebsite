const createApp = require('./create.app');
const config = require('./config');
const {
  getDBConnection,
  UserRepository,
  ContactRepository,
  EmailVerifyRepository,
  PasswordResetRepository,
  UserRoleRepository
} = require('./database');
const { EmailService } = require('./services');

(async () => {
  await getDBConnection();
  
  await UserRepository.initialize();
  await ContactRepository.initialize();
  await EmailVerifyRepository.initialize();
  await PasswordResetRepository.initialize();
  await UserRoleRepository.initialize();

  EmailService.initialize();

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
