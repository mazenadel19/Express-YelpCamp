if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');

const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');

const ExpressError = require('./utils/ExpressError');
const User = require('./models/User');

const app = express();
const db = mongoose.connection;

const PORT = process.env.PORT || 3000;

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
	.catch(e => {
		console.log('FAILED CONNECT TO MONGODB!!!'.brightYellow);
		console.log(`${e}.brightYellow`);
		/* eslint-disable no-console */
	});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(mongoSanitize({ replaceWith: '_' })); // searches for any keys in objects that begin with a "$" sign or contain a ".", from req.body, req.query or req.params and replace them with "_" to protect against mongo injection!

app.use(helmet()); // add more security by setting various HTTP headers
const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net/',
];
const connectSrcUrls = [
	'https://api.mapbox.com/',
	'https://a.tiles.mapbox.com/',
	'https://b.tiles.mapbox.com/',
	'https://events.mapbox.com/',
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/skywa1ker/',
				'https://images.unsplash.com/',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	}),
);
const sessionConfig = {
	name: 'session', // to change the name of my session cookie from connect.sid to session (in case someone wrote some script to get data from connect.sid since it's default name for session and now he might have access on other users data and use it pretending to be them)
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true, // for security against cross-site scripting //!change to false when testing to console log the req.user value
		// secure:true, // to make our session cookie only accessible over https
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // setting expiry date for the cookie a week form now
		// we set expiry date so user won't stay logged in forever once he log in once
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

// "THE SESSION MIDDLEWARE MUST COME BEFORE MY ROUTES else the session cookie wont show up in the browser terminal
app.use(session(sessionConfig));
app.use(flash());

//! DOCS : passport.session must be used AFTER app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session()); // used to have persistent login sessions else you'll have to login with every new page request
passport.use(new LocalStrategy(User.authenticate())); // tell passport to use local strategy and the authentication for local strategy is found on a method called authenticate() in the user model

passport.serializeUser(User.serializeUser()); // defines how to add user to session
//! and what data should be added in this session! >>> found in req.user
passport.deserializeUser(User.deserializeUser()); // defines how to remove user from session

//* NB: authenticate(), serializeUser(), deserializeUser() methods are created implicitly by passport-local-mongoose when it's called/plugged-in and will be found on the user model

app.use((req, res, next) => {
	// console.log(req.session);
	if (!['/login', '/register', '/'].includes(req.originalUrl)) {
		// if the req.originalUrl doesn't equal '/','/register' or ''
		req.session.returnTo = req.originalUrl;
	}
	res.locals.currentUser = req.user; // .user is a property made by passport on the request  returns information about current authenticated user

	res.locals.successMsg = req.flash('success');
	res.locals.errorMsg = req.flash('error');
	next();
});

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
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

app.listen(PORT, () => {
	console.log('LISTENING ON PORT 3000'.bgGrey);
});
