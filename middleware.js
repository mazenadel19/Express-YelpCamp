const { campgroundSchema, reviewSchema } = require('./schemas'); // joi
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/Campground');
const Review = require('./models/Review');

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

module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		return next();
	}
};

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author._id.equals(req.user._id)) {
		req.flash('error', `You don't have permission to do that!`);
		return res.redirect(`/campgrounds/${id}`);
	}
	return next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author._id.equals(req.user._id)) {
		req.flash('error', `You don't have permission to do that!`);
		return res.redirect(`/campgrounds/${id}`);
	}
	return next();
};

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		return next();
	}
};
