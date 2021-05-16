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
		const registeredUser = await User.register(user, password); // second argument is the password, register is another method thanks to passport-local-mongoose that check if the username is unique , if true it adds it with the hashed password

		console.log(registeredUser);

		req.login(registeredUser, (err) => {
			if (err) return next(err);
			req.flash('success', 'Welcome To YelpCamp');
			return res.redirect('/campgrounds');
		}); // to save the user in the session after he register so he doesn't have to login separately, if he registered he's logged in
	} catch (e) {
		// original error message was long and not user friendly so I changed it "E11000 duplicate key error collection: yelp-camp.users index: email_1 dup keys"
		if (e.message.split(' ')[0] === 'E11000') {
			e.message = 'A User already exist with this email';
		}
		req.flash('error', e.message);
		res.redirect('/register');
	}
};

// NB passport.authenticate middleware invokes req.login() (automatically logs you in the session)

module.exports.renderLogin = (req, res) => {
	res.render('user/login');
};

module.exports.login = (req, res) => {
	req.flash('success', 'Welcome back!');
	const redirectUrl = req.session.returnTo || '/campgrounds';
	delete req.session.returnTo; // cuz we don't want returnTo to stay in our session data (ian thinks the same as i do  .. it's useless as i'm creating a return to on req.session with every request)
	res.redirect(redirectUrl);
	// Passport.authenticate defines my authentication strategy, local is for forms i made myself but u can also use google or facebook or github ... etc for other ways of authentication

	// it checks if I'm a legitimate user who has registered if yes the middleware pass me to the flash and i get my data registered in the session by something similar to
	// ! req.session.user._id=user._id
};

module.exports.logout = (req, res) => {
	req.logout(); // method from passport to log u out of the session
	req.flash('success', 'Goodbye!');
	res.redirect('/campgrounds'); // ? redirecting to '/' caused a bug when I try to login more than once in the same session .. worked on colt's but mine resulted in loop inside some passport files ending up logging me out
};
