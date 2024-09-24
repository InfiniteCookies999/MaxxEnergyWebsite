const express = require('express');
const { controller, validateLoggedIn, validateBody, validateUserIds } = require('../middleware');
const { UserService, EmailService } = require('../services');
const { UserRoleRepository, AuditLogRepository, UserRepository } = require('../database');
const { body } = require('express-validator');

const EMAIL_PATTERN  = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const router = express.Router();

router.use(express.urlencoded({extended: false}));
router.use(express.json());

router.post('/send-email',
  body('emails').optional().notEmpty().withMessage("emails cannot be empty")
    .custom((emails) => {
      if (!emails.every(email => typeof email === 'string' && EMAIL_PATTERN.test(email))) {
        return false;
      }
      return true;
    }),
  body('subject').notEmpty().withMessage("subject cannot be empty")
    .isString().withMessage("subject must be a string"),
  body('body').notEmpty().withMessage("body cannot be empty")
    .isString().withMessage("body must be a string!"),
  body('sendToAll').notEmpty().isBoolean(),
  
  validateBody,
  validateLoggedIn,
  controller(async (req, res) => {
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }
    
    let emails = [];
    if (req.body.sendToAll) {
      emails = await UserService.getAllEmails();
    } else {
      emails = req.body.emails;
    }
    
    for (const email of emails) {
      EmailService.send({
        to: email,
        subject: req.body.subject,
        text: req.body.body
      });
    }

    res.send();
}));

router.post("/send-audit-logs",
  validateUserIds('userIds'),

  controller(async (req, res) => {
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    const users = [];

    const dateOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24-hour format
    };
    for (const userId of req.body.userIds) {
      const user = await UserRepository.getUserById(userId);
      user.auditLogs = await AuditLogRepository.getAuditLogsForUserId(userId);
      for (const auditLog of user.auditLogs) {
        auditLog.date = new Date(auditLog.date).toLocaleDateString('en-US', dateOptions);
      }
        
      users.push(user);
    }

    const sessionUser = await UserService.getUserById(req.session.user.id);

    EmailService.sendHbs({
      to: sessionUser.email,
      subject: "Audit Logs",
      hbsFile: "audit-logs-email",
      context: {
        users: users
      },
      attachments: []
    });

    res.send();
}));

module.exports = router;