const express = require('express');

const router = express.Router({ mergeParams: true });

// { mergeParams: true } needed in order to have access to the params in the route from app file else will get a null when i try to read them

const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	catchAsync(reviews.deleteReveiew),
);

module.exports = router;
