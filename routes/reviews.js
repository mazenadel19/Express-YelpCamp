const express = require('express');

const router = express.Router({ mergeParams: true });

// { mergeParams: true } needed in order to have access to the params in the route from app file else will get a null when i try to read them

const Review = require('../models/Review');
const Campground = require('../models/Campground');

const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post(
	'/',
	isLoggedIn,
	validateReview,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		const { rating, body } = req.body.review;
		const review = new Review({ rating, body });
		review.author = req.user._id;
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', 'Created New Review!');
		res.redirect(`/campgrounds/${id}`);
	}),
);

router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
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
