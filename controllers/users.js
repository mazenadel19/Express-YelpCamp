const User = require('../models/User');

module.exports.renderRegister = (req, res) => {
	res.render('user/register');
};

module.exports.register = async (req, res, next) => {
	try {
		const { username, email, password } = req.body;
		const user = new User({
			username,
			email,
		});
		const registeredUser = await User.register(user, password);

		req.login(registeredUser, err => {
			if (err) return next(err);
			req.flash('success', 'Welcome To YelpCamp');
			return res.redirect('/campgrounds');
		});
		console.log(registeredUser,'yes take that _id');
	} catch (e) {
		if (e.message.split(' ')[0] === 'E11000') {
			e.message = 'A User already exist with this email';
		}
		req.flash('error', e.message);
		res.redirect('/register');
	}
};

module.exports.renderLogin = (req, res) => {
	res.render('user/login');
};

module.exports.login = (req, res) => {
	req.flash('success', 'Welcome back!');
	const redirectUrl = req.session.returnTo || '/campgrounds';
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'Goodbye!');
	res.redirect('/campgrounds');
};
