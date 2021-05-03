module.exports.isLoggedIn = (req, res, next) => {
	// console.log('REQ.USER...',req.user) // returns deserialized (no hash or salt) information of my user

	if (!req.isAuthenticated()) {
		// console.log(req.path, req.originalUrl);


		// isAuthenticated is a method from passport
		// it's used here to make sure only registered users can create a campground
		req.flash('error', 'You must be signed in first!');
		return res.redirect('/login');
	}
	return next();
};
