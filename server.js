const createApp = require('./create.app');
const config = require('./config');
const { getDBConnection, UserRepository, ContactRepository } = require('./database');
const { EmailService } = require('./services');

(async () => {
  await getDBConnection();
  
  await UserRepository.initialize();
  await ContactRepository.initialize();

  EmailService.initialize();

  const PORT = config.SERVER_PORT || 3000;

  const app = createApp();
  app.listen(PORT, (err) => {
    if (!err) {
      console.log(`Server started on: ${PORT}`);
    } else {
      console.log(`Error starting server: ${err}`);
    }
  });

})();
