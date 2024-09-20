const express = require('express');
const { BannedRepository, UserRoleRepository } = require('../database');
const { validateLoggedIn, controller } = require('../middleware');
const { UserService } = require('../services');
const { query } = require('express-validator');

const router = express.Router();

router.get('/banned',
  query('page').notEmpty().withMessage("The page cannot be empty")
    .isInt(),

  validateLoggedIn,
  controller(async (req, res) => {
    if (!(await UserService.userSessionHasRole(req.session, UserRoleRepository.adminRole()))) {
      throw new HttpError("Only admins can access", 401);
    }

    const page = req.query.page;

    const pageSize = 12;
    const bans = await BannedRepository.getPageOfBans(page, pageSize, '', '');
    const total = await BannedRepository.totalBans('', '');

    res.json({
        bans,
        totalPages: Math.ceil(total / pageSize)
      });
}));

module.exports = router;
