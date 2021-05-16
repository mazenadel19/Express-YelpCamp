const express = require('express');

const router = express.Router();

const Campground = require('../models/Campground');

const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

router.get(
	'/',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({}).populate('author');
		res.render('campgrounds/index', { campgrounds });
	}),
);

router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		campground.author = req.user._id;
		await campground.save();

		req.flash('success', 'Successfully Created Campground!');
		res.redirect(`/campgrounds/${campground.id}`);
	}),
);

router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		if (!campground) {
			req.flash('error', 'Cannot Find That Campground!');
			return res.redirect('/campgrounds');
		}
		req.flash('success', 'Successfully Edited Campground!');
		return res.render('campgrounds/edit', { campground });
	}),
);

router.put(
	'/:id',
	isLoggedIn,
	isAuthor,
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const camp = await Campground.findByIdAndUpdate(
			id,
			{ ...req.body.campground },
			{
				new: true,
				runValidators: true,
			},
		);
		// console.log(camp);
		req.flash('success', 'Successfully Updated Campground!');
		res.redirect(`/campgrounds/${camp.id}`);
	}),
);

router.delete(
	'/:id',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const camp = await Campground.findByIdAndDelete(id);
		// console.log(camp, 'was deleted successfully'.blue);
		req.flash('success', 'Successfully Deleted Campground!');
		res.redirect(`/campgrounds`);
	}),
);

router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await await Campground.findById(id)
			.populate({ path: 'reviews', populate: { path: 'author' } })
			.populate('author');
		if (!campground) {
			req.flash('error', 'Cannot Find That Campground!');
			return res.redirect('/campgrounds');
		}
		// console.log(campground);
		return res.render('campgrounds/show', { campground });
	}),
);

module.exports = router;
