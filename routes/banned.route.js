const express = require('express');
const { BannedRepository, UserRoleRepository } = require('../database');
const { validateLoggedIn, controller, validateBody } = require('../middleware');
const { UserService } = require('../services');
const { query, body } = require('express-validator');
const bannedService = require('../services/banned.service');

const router = express.Router();

router.get('/banned',
  query('page').notEmpty().withMessage("The page cannot be empty")
    .isInt(),
  query('email').optional(),
  query('ip').optional(),

  validateLoggedIn,
  controller(async (req, res) => {
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    const page = req.query.page;
    const emailSearch = req.query.email || '';
    const ipSearch = req.query.ip || '';

    const pageSize = 12;
    const bans = await BannedRepository.getPageOfBans(page, pageSize, emailSearch, ipSearch);
    const total = await BannedRepository.totalBans(emailSearch, ipSearch);

    res.json({
        bans,
        totalPages: Math.ceil(total / pageSize)
      });
}));

router.delete('/banned',
  body('banIds').notEmpty().withMessage("banIds cannot be empty")
    .isArray({ min: 1 }).withMessage("Expected an array")
    .bail()
    .custom((arr) => {
      return arr.every(e => Number.isInteger(e));
    }).withMessage("All elements must be integers"),    
  validateBody,

  validateLoggedIn,
  controller(async (req, res) => {
    
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    const banIds = req.body.banIds;

    for (const banId of banIds) {
      await bannedService.deleteBan(banId);
    }

    res.send();
}));


module.exports = router;
