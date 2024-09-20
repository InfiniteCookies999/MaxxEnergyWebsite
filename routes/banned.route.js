const express = require('express');
const { BannedRepository, UserRoleRepository } = require('../database');
const { validateLoggedIn, controller } = require('../middleware');
const { UserService } = require('../services');
const { query } = require('express-validator');

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

module.exports = router;
