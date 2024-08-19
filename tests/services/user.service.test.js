const UserRepository = require('../../database/user.repository');
const User = require('../../database/user.model');
const UserService = require('../../services/user.service');
const bcrypt = require('bcryptjs');
const HttpError = require('../../middleware/http.error');

jest.mock('../../database/user.repository');
jest.mock('bcryptjs');

function getValidRegisterBody() {
  return {
    firstName: "Susan",
    lastName: "Smith",
    email: "susansmith@gmail.com",
    phoneNumber: "999-999-9999",
    state: "VA",
    county: "Campbell County",
    addressLine1: "Street Ave. 1412",
    zipCode: 77777,
    password: "abcABC%*13"
  };
}

function getValidLoginBody() {
  return {
    email: "susansmith@gmail.com",
    password: "password"
  };
}

function getUserModel(body, hashedPassword) {
  return new User(1,
    body.firstName, body.lastName, body.email, body.phoneNumber,
    body.state, body.county, body.addressLine1, body.addressLine2 || null,
    body.zipCode, hashedPassword, new Date()
  );
}

describe('UserService', () => {
  
  describe('#register', () => {
    it('User already logged in', async () => {
      
      const body = getValidRegisterBody();
      const session = {
        user: {
          id: 1
        }
      };

      UserRepository.doesUserExistByEmail.mockResolvedValue(false);

      await expect(async () => {
        await UserService.register(body, session);
      }).rejects.toThrow(new HttpError("Already logged in", 409));
      expect(UserRepository.saveUser).not.toHaveBeenCalled();

    });
    it('Email already taken', async () => {
      
      const body = getValidRegisterBody();
      const session = {};

      UserRepository.doesUserExistByEmail.mockResolvedValue(true);

      await expect(async () => {
        await UserService.register(body, session);
      }).rejects.toThrow(new HttpError("Email taken", 403));
      expect(UserRepository.saveUser).not.toHaveBeenCalled();

    });
    it('Successfull registration', async () => {

      const body = getValidRegisterBody();
      const session = {};
      const hashedPassword = "hashedPassword";

      UserRepository.doesUserExistByEmail.mockResolvedValue(false);
      UserRepository.saveUser.mockResolvedValue(getUserModel(body, hashedPassword));
      bcrypt.hash.mockResolvedValue(hashedPassword);

      await UserService.register(body, session);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(UserRepository.saveUser).toHaveBeenCalled();
      expect(session.user).toStrictEqual({ id: 1 });
      
    });
  });

  describe('#login', () => {
    it('User already logged in', async () => {
      
      const body = getValidLoginBody();
      const session = {
        user: {
          id: 1
        }
      };

      await expect(async () => {
        await UserService.login(body.email, body.password, session);
      }).rejects.toThrow(new HttpError("Already logged in", 409));

    });
    it('User does not exist by email', async () => {

      const body = getValidLoginBody();
      const session = {};

      UserRepository.getUserByEmail.mockResolvedValue(null);

      await expect(async () => {
        await UserService.login(body.email, body.password, session);
      }).rejects.toThrow(new HttpError("Invalid email or password", 401));
      expect(session.user).toBe(undefined)
      expect(bcrypt.compare).not.toHaveBeenCalled();

    });
    it('Incorrect password', async () => {

      const body = getValidLoginBody();
      const session = {};

      UserRepository.getUserByEmail.mockResolvedValue(getUserModel(body, "hashedPassword"));
      bcrypt.compare.mockResolvedValue(false);

      await expect(async () => {
        await UserService.login(body.email, body.password, session);
      }).rejects.toThrow(new HttpError("Invalid email or password", 401));
      expect(session.user).toBe(undefined)
      expect(bcrypt.compare).toHaveBeenCalled();

    });
    it('Successfull login', async () => {

      const body = getValidLoginBody();
      const session = {};

      const model = getUserModel(body, "hashedPassword");
      console.log(model.id);

      UserRepository.getUserByEmail.mockResolvedValue(getUserModel(body, "hashedPassword"));
      bcrypt.compare.mockResolvedValue(true);

      await UserService.login(body.email, body.password, session);
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(session.user).toStrictEqual({ id: 1 });

    });
  });
});
