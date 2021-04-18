/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const ejsMate = require('ejs-mate');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');

const mongoose = require('mongoose');
const Review = require('./models/review');
const Campground = require('./models/campground');

const { campgroundSchema, reviewSchema } = require('./schemas'); // joi

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

const app = express();
const db = mongoose.connection;

mongoose
	.connect('mongodb://localhost:27017/yelp-camp', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('CONNECTED TO MONGODB!!!'.bgGrey);
	})
	.catch((e) => {
		console.log('FAILED CONNECT TO MONGODB!!!'.brightYellow);
		console.log(`${e}.brightYellow`);
	});

mongoose.set('useFindAndModify', false);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		return next();
	}
};

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		return next();
	}
};

app.get('/', (req, res) => {
	console.log('get request to home route'.brightCyan);
	res.render('home');
});

app.get(
	'/campgrounds',
	catchAsync(async (req, res) => {
		console.log('get request to index route'.brightCyan);
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	}),
);

app.get('/campgrounds/new', (req, res) => {
	console.log('get request to new route'.brightCyan);
	res.render('campgrounds/new');
});

app.post(
	'/campgrounds',
	validateCampground,
	catchAsync(async (req, res, next) => {
		console.log('post request to create route'.brightCyan);
		// if (!req.body.campground) {
		// 	throw new ExpressError('Invalid Campground data', 400);
		// }

		const camp = new Campground(req.body.campground);
		await camp.save();
		console.log(`${camp}`.brightMagenta);
		res.redirect(`/campgrounds/${camp.id}`);
	}),
);

app.get(
	'/campgrounds/:id/edit',
	catchAsync(async (req, res) => {
		console.log('get request to edit route'.brightCyan);
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/edit', { campground });
	}),
);

app.put(
	'/campgrounds/:id',
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
		res.redirect(`/campgrounds/${camp.id}`);
	}),
);

app.delete(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		console.log('delete request'.brightCyan);
		const { id } = req.params;
		const camp = await Campground.findByIdAndDelete(id);
		console.log(camp, 'was deleted successfully'.blue);
		res.redirect(`/campgrounds`);
	}),
);

app.get(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		console.log('get request to show route'.brightCyan);
		const { id } = req.params;
		const campground = await Campground.findById(id).populate('reviews');
		res.render('campgrounds/show', { campground });
	}),
);

app.post(
	'/campgrounds/:id/reviews',
	validateReview,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		const { rating, body } = req.body.review;
		const review = new Review({ rating, body });
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		res.redirect(`/campgrounds/${id}`);
	}),
);

app.delete(
	'/campgrounds/:id/reviews/:reviewId',
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		/**
		 *	pulling review from campground (campground.reviews) which match reviewId
		 *	we did that cuz campground is storing a foreign key for reviews
		 *	in mongoose deleting the  pk doesn't delete the fk
		 */
		await Review.findByIdAndDelete(reviewId);
		res.redirect(`/campgrounds/${id}`);
	}),
);

app.all('*', (req, res, next) => {
	console.log(`sorry couldn't find the route you were looking for`.yellow);
	console.log(req.path);
	next(new ExpressError('PAG3 N0T F0UND', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) {
		err.message = "something went terribly wrong, I've no idea what happened";
	}
	res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
	console.log('LISTENING ON PORT 3000'.bgGrey);
});
