const express = require('express');
const Passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const user = require('../controllers/users');

const router = express.Router();

router.get('/register', user.renderRegister);

router.post('/register', catchAsync(user.register));

router.get('/login', user.renderLogin);

router.post(
	'/login',
	Passport.authenticate('local', {
		failureFlash: true,
		failureRedirect: '/login',
	}),
	user.login,
);

router.get('/logout', user.logout);

module.exports = router;
