const Campground = require('../models/Campground');
const Review = require('../models/Review');

module.exports.createReview = async (req, res) => {
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
};

module.exports.deleteReveiew = async (req, res) => {
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
};
