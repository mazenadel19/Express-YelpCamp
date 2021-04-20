/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');

const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const app = express();
const db = mongoose.connection;

mongoose
	.connect('mongodb://localhost:27017/yelp-camp', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log('CONNECTED TO MONGODB!!!'.bgGrey);
	})
	.catch((e) => {
		console.log('FAILED CONNECT TO MONGODB!!!'.brightYellow);
		console.log(`${e}.brightYellow`);
	});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));

const sessionConfig = {
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true, // for security against cross-site scripting
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // setting expiry date for the cookie a week form now
		// we set expiry date so user won't stay logged in forever once he log in once
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

// "THE SESSION MIDDLEWARE MUST COME BEFORE MY ROUTES else the session cookie wont show up in the browser terminal
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
	res.locals.successMsg = req.flash('success');
	res.locals.errorMsg = req.flash('error');
	next();
});

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
	console.log('get request to home route'.brightCyan);
	res.render('home');
});

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
