const express = require('express');
const Passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const user = require('../controllers/users');

const router = express.Router();

router
	.route('/register')
	.get(user.renderRegister)
	.post(catchAsync(user.register));

router
	.route('/login')
	.get(user.renderLogin)
	.post(
		Passport.authenticate('local', {
			failureFlash: true,
			failureRedirect: '/login',
		}),
		user.login,
	);

router.get('/logout', user.logout);

module.exports = router;
