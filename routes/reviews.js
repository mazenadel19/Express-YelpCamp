const express = require('express');

const router = express.Router({ mergeParams: true });

// { mergeParams: true } needed in order to have access to the params in the route from app file else will get a null when i try to read them

const Review = require('../models/Review');
const Campground = require('../models/Campground');

const { reviewSchema } = require('../schemas'); // joi

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		return next();
	}
};

router.post(
	'/',
	validateReview,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		const { rating, body } = req.body.review;
		const review = new Review({ rating, body });
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', 'Created New Review!');
		res.redirect(`/campgrounds/${id}`);
	}),
);

router.delete(
	'/:reviewId',
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		/**
		 *	pulling review from campground (campground.reviews) which match reviewId
		 *	we did that cuz campground is storing a foreign key for reviews
		 *	in mongoose deleting the  pk doesn't delete the fk
		 */
		await Review.findByIdAndDelete(reviewId);
		req.flash('success', 'Successfully Deleted Review!');
		res.redirect(`/campgrounds/${id}`);
	}),
);

module.exports = router;
