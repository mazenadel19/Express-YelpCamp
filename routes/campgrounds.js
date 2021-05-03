const express = require('express');

const router = express.Router();

const Campground = require('../models/Campground');
const { campgroundSchema } = require('../schemas'); // joi
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const { isLoggedIn } = require('../middleware');

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		return next();
	}
};

router.get(
	'/',
	catchAsync(async (req, res) => {
		console.log('get request to index route'.brightCyan);
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	}),
);

router.get('/new', isLoggedIn, (req, res) => {
	console.log('get request to new route'.brightCyan);
	res.render('campgrounds/new');
});

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		console.log('post request to create route'.brightCyan);

		const camp = new Campground(req.body.campground);
		await camp.save();
		console.log(`${camp}`.brightMagenta);

		req.flash('success', 'Successfully Created Campground!');
		res.redirect(`/campgrounds/${camp.id}`);
	}),
);

router.get(
	'/:id/edit',
	isLoggedIn,
	catchAsync(async (req, res) => {
		console.log('get request to edit route'.brightCyan);
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
	validateCampground,
	catchAsync(async (req, res) => {
		console.log('put request to update route'.brightCyan);
		const { id } = req.params;
		const camp = await Campground.findByIdAndUpdate(
			id,
			{ ...req.body.campground },
			{
				new: true,
				runValidators: true,
			},
		);
		console.log(camp);
		req.flash('success', 'Successfully Updated Campground!');
		res.redirect(`/campgrounds/${camp.id}`);
	}),
);

router.delete(
	'/:id',
	isLoggedIn,
	catchAsync(async (req, res) => {
		console.log('delete request'.brightCyan);
		const { id } = req.params;
		const camp = await Campground.findByIdAndDelete(id);
		console.log(camp, 'was deleted successfully'.blue);
		req.flash('success', 'Successfully Deleted Campground!');
		res.redirect(`/campgrounds`);
	}),
);

router.get(
	'/:id',
	catchAsync(async (req, res) => {
		console.log('get request to show route'.brightCyan);
		const { id } = req.params;
		const campground = await Campground.findById(id).populate('reviews');
		if (!campground) {
			req.flash('error', 'Cannot Find That Campground!');
			return res.redirect('/campgrounds');
		}
		return res.render('campgrounds/show', { campground });
	}),
);


module.exports = router;
