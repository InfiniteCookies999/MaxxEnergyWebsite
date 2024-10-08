const express = require('express');
const multer = require('multer');
const {
  controller,
  validateBody,
  validateLoggedIn,
  validateFileExists,
  fileFilter,
  validateUserIds
} = require('../middleware'); 
const { body, query } = require('express-validator');
const COUNTIES = require('./counties');
const { UserRepository, UserRoleRepository, AuditLogRepository } = require('../database');
const { UserService, PasswordResetService } = require('../services');

const NAME_PATTERN = /^[a-zA-Z0-9]+$/;

const ADDRESS_LINE_PATTERN = /^[a-zA-Z0-9 .'\-#@%&]+$/;
const ADDRESS_LINE_MAX_LENGTH = 250;

const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

const PHONE_PATTERN = /^(\d{3})\-(\d{3})\-(\d{4})$/;

const router = express.Router();

router.use(express.urlencoded({extended: false}));
router.use(express.json());

const fileUpload = multer({
  dest: '/upload',
  fileFilter:  fileFilter(UserRepository.validProfilePicMimetypes())
});

function validateName(fieldName) {
  return body(fieldName)
    .notEmpty().withMessage("Cannot be empty")
    .isLength({ min: 1, max: UserRepository.maxNameLength() }).withMessage("Invalid length")
    .matches(NAME_PATTERN).withMessage("Name must be alphanumeric");
}

function validateAddressLine(fieldName, isOptional) {
  let chain = body(fieldName);
  if (isOptional) {
    chain = chain.optional();
  }
  return chain
    .notEmpty().withMessage("Cannot be empty")
    .isLength({ min: 1, max: ADDRESS_LINE_MAX_LENGTH }).withMessage("Invalid length")
    .matches(ADDRESS_LINE_PATTERN).withMessage("Invalid address format");
}

function validatePhoneNumber(fieldName) {
  return body(fieldName).notEmpty().withMessage("Cannot be empty")
    .matches(PHONE_PATTERN).withMessage("Invalid phone format");
}

function validateState(fieldName) {
  return body(fieldName).notEmpty().withMessage("Cannot be empty")
    .isIn(UserRepository.validStates()).withMessage("Unknown state");
}

function validateCounty(fieldName) {
  return body(fieldName)
    .notEmpty().withMessage("Cannot be empty")
    .custom((value, { req }) => {
      const state = req.body.state;
      if (!state) {
        // The state does not exist so cannot really check properly.
        return true;
      }
      const countyList = COUNTIES[state];
      if (!countyList) {
        // The user did not provide a valid state so cannot really check properly.
        return true;
      }
      // TODO: Consider improving performance by having these be sets instead.
      return countyList.includes(value.replaceAll("-", " "));
    }).withMessage("Unknown county");
}

function validateZipCode(fieldName) {
  return body(fieldName).notEmpty().withMessage("Cannot be empty")
    .isInt({ min: 0, max: 99999 }).withMessage("Expected valid integer range");
}

function validatePassword(fieldName) {
  return body(fieldName).notEmpty().withMessage("Cannot be empty")
    .isLength({ min: 1, max: UserRepository.maxPasswordLength() }).withMessage("Invalid length")
    .matches(PASSWORD_PATTERN).withMessage("Invalid format");
}

function validateExistingPassword(fieldName) {
  return body(fieldName).notEmpty().withMessage("Cannot be empty")
  . isLength({ min: 0, max: UserRepository.maxPasswordLength() }).withMessage("Invalid length");
}

router.post('/user/register',
  validateName('firstName'),
  validateName('lastName'),
  body('email').isEmail().withMessage("Expected valid email address"),
  validatePhoneNumber('phoneNumber'),
  validateState('state'),
  validateCounty('county'),
  validateAddressLine('addressLine1'),
  validateAddressLine('addressLine2', true),
  validateZipCode('zipCode'),
  validatePassword('password'),

  validateBody,
  controller(async (req, res) => {
    await UserService.register(req.body, req.session, req.serverAddress);
    res.send();
}));

router.post('/user/login',
  body('email').isEmail().withMessage("Expected valid email address"),
  validateExistingPassword('password'),
  
  validateBody,
  controller(async (req, res) => {
    await UserService.login(req.body.email, req.body.password, req.session);
    res.send();
  })
);

router.put('/user/update-name/:id?',
  validateName('firstName'),
  validateName('lastName'),

  validateBody,
  validateLoggedIn,
  controller(async (req, res) => {
    await UserService.updateName(req.params.id,
                                 req.body.firstName,
                                 req.body.lastName,
                                 req.session);
    res.send();
  })
);

router.put('/user/update-email/:id?',
  body('email').isEmail().withMessage("Expected valid email address"),
  
  validateBody,
  validateLoggedIn,
  controller(async (req, res) => {
    await UserService.updateEmail(req.params.id,
                                  req.body.email,
                                  req.session,
                                  req.serverAddress);
    res.send();
  })
);

router.put('/user/update-phone/:id?',
  validatePhoneNumber('phoneNumber'),
  
  validateBody,
  validateLoggedIn,
  controller(async (req, res) => {
    await UserService.updatePhoneNumber(req.params.id,
                                        req.body.phoneNumber,
                                        req.session);
    res.send();
  })
);

router.put('/user/update-address/:id?',
  validateState('state'),
  validateCounty('county'),
  validateAddressLine('addressLine1'),
  validateAddressLine('addressLine2', true),
  validateZipCode('zipCode'),

  validateBody,
  validateLoggedIn,
  controller(async (req, res) => {
    await UserService.updateAddress(req.params.id,
                                    req.body.state,
                                    req.body.county,
                                    req.body.addressLine1,
                                    req.body.addressLine2,
                                    req.body.zipCode,
                                    req.session);
    res.send();
  })
);

router.put('/user/update-password/:id?',
  validateExistingPassword('oldPassword'),
  validatePassword("newPassword"),
  
  validateBody,
  validateLoggedIn,
  controller(async (req, res) => {
    await UserService.updatePassword(req.params.id,
                                     req.body.oldPassword,
                                     req.body.newPassword,
                                     req.session);
    res.send();
  })
);

router.put('/user/update-profile-pic/:id?',
  fileUpload.single('file'),

  validateFileExists,
  validateLoggedIn,
  controller(async (req, res) => {
    await UserService.updateProfilePic(req.params.id,
                                       req.file,
                                       req.session);
    res.send();
  })
);

router.put('/user/verify-email/:token',
  
  controller(async (req, res) => {
    const userId = await UserService.verifyEmail(req.params.token, req.session);
    res.json({ userId });
  })
);

router.put('/user/resend-email-verification',

  validateLoggedIn,
  controller(async (req, res) => {
    await UserService.resendEmailVerification(req.session, req.serverAddress);
    res.send();
  })
);

router.post('/user/request-password-reset', 
  body('email').isEmail().withMessage("Expected valid email address"),

  validateBody,
  controller(async (req, res) => {
    await UserService.sendPasswordReset(req.body.email, req.serverAddress);
    res.send();
  })
);

router.put('/user/password-reset',
  body('token').notEmpty().withMessage("Token cannot be empty"),
  validatePassword('newPassword'),

  validateBody,
  controller(async (req, res) => {
    await UserService.resetPassword(req.body.token, req.body.newPassword);
    res.send();
  })
);

router.get('/user/check-password-reset-token/:token',
  controller(async (req, res) => {
    const isValid = await PasswordResetService.isValidToken(req.params.token);
    res.json({ isValid });
  })
);

router.get('/user/users',
  query('page').notEmpty().withMessage("The page cannot be empty")
    .isInt(),
  query('email').optional(),
  query('name').optional(),
  query('phone').optional(),
  query('state').optional(),
  query('county').optional(),
  query('id').optional(),
  query('zipcode').optional(),
  query('fullAddress').optional(),
  validateBody,

  validateLoggedIn,
  controller(async (req, res) => {

  if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
    throw new HttpError("Only admins can access", 401);
  }

  const page = req.query.page;
  const emailSearch = req.query.email || '';
  const nameSearch = req.query.name || '';
  const phoneSearch = req.query.phone || '';
  const stateSearch = req.query.state || '';
  const countySearch = (req.query.county || '').replaceAll(/\s+/g, "-");
  const idSearch = req.query.id || '';
  const zipcodeSearch = req.query.zipcode || '';
  const fullAddressSearch = (req.query.fullAddress || '').replaceAll(/\s+/g, " ");

  const nameParts = nameSearch.trim().split(" ");
  const firstName = nameParts[0]?.trim() || '';
  const lastName = nameParts[1]?.trim() || '';

  const pageSize = 12;
  let users = await UserRepository.getPageOfUsers(page, pageSize,
    emailSearch, firstName, lastName, phoneSearch, stateSearch,
    countySearch, idSearch, zipcodeSearch, fullAddressSearch);
  // Also search for if the only provide last name.
  if (firstName !== '' && lastName === '') {
    const users1 = await UserRepository.getPageOfUsers(page, pageSize,
      emailSearch, '', firstName, phoneSearch, stateSearch,
      countySearch, idSearch, zipcodeSearch, fullAddressSearch);
    users = users.concat(users1);
  }
  
  let total = await UserRepository.totalUsers(emailSearch, firstName, lastName,
    phoneSearch, stateSearch, countySearch, idSearch, zipcodeSearch, fullAddressSearch);
  if (firstName !== '' && lastName === '') {
    const total1 = await UserRepository.totalUsers(emailSearch, '', firstName,
      phoneSearch, stateSearch, countySearch, idSearch, zipcodeSearch, fullAddressSearch);
    total += total1;
  }
  
  for (const user of users) {
    const roles = await UserRoleRepository.getRolesForUserId(user.id);
    const rolesJoined = roles
      .map((role) => role.roleName)
      .join();
    user.roles = roles;
    user.rolesJoined = rolesJoined;
    
    user.county = user.county.replaceAll("-", " ");

    user.auditLogs = JSON.stringify(await AuditLogRepository.getAuditLogsForUserId(user.id));
  }

  res.json({
    users,
    totalPages: Math.ceil(total / pageSize)
  });
}));

router.delete('/user',
  validateUserIds('userIds'),
  validateBody,

  validateLoggedIn,
  controller(async (req, res) => {
    
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    const userIds = req.body.userIds;

    for (const userId of userIds) {
      await UserService.deleteUser(userId);
    }

    res.send();
}));

router.put('/user/add-roles',
  validateUserIds('userIds'),
  body('role').isIn(UserRoleRepository.rolls()),

  validateLoggedIn,
  controller(async (req, res) => {

    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    for (const userId of req.body.userIds) {
      await UserService.addRoleIfNotExistByUserId(userId, req.body.role);
    }

    res.send();
}));

router.delete('/user/remove-role',
  body('userId').isInt().withMessage("Must be an integer for id"),
  body('role').isIn(UserRoleRepository.rolls()),

  validateLoggedIn,
  controller(async (req, res) => {

    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    await UserService.removeRoleFromUserById(req.body.userId, req.body.role);

    res.send();
}));

module.exports = router;