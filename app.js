/* eslint-disable no-console */
const colors = require('colors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req, res) => {
	console.log('get request to home path'.brightCyan);
	res.render('home');
});

app.get('/campgrounds', async (req, res) => {
	console.log('get request to index path'.brightCyan);
	const camps = await Campground.find({});
	res.render('campgrounds/index', { camps });
});

app.get('/campgrounds/new', (req, res) => {
	console.log('get request to new path'.brightCyan);
	res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
	console.log('post request to create path'.brightCyan);
	const camp = new Campground(req.body.campground);
	await camp.save();
	console.log(`${camp}`.brightMagenta);
	res.redirect(`/campgrounds/${camp.id}`);
});

app.get('/campgrounds/:id/edit', async (req, res) => {
	console.log('get request to edit path'.brightCyan);
	const camp = await Campground.findById(req.params.id);
	res.render('campgrounds/edit', { camp });
});

app.put('/campgrounds/:id', async (req, res) => {
	console.log('put request to update path'.brightCyan);
	const { id } = req.params;
	const camp = await Campground.findByIdAndUpdate(id, req.body.campground, {
		new: true,
		runValidators: true,
	});
	console.log(camp);
	res.redirect(`/campgrounds/${camp.id}`);
});

app.delete('/campgrounds/:id', async (req, res) => {
	console.log('delete request'.brightCyan);
	const { id } = req.params;
	const camp = await Campground.findByIdAndDelete(id);
	console.log(camp, 'was deleted successfully'.blue);
	res.redirect(`/campgrounds`);
});

app.get('/campgrounds/:id', async (req, res) => {
	console.log('get request to show path'.brightCyan);
	const { id } = req.params;
	const camp = await Campground.findById(id);
	res.render('campgrounds/show', { camp });
});

app.get('*', (req, res) => {
	console.log(`sorry couldn't find the path you were looking for`.yellow);
	res.render('home');
});

app.listen(3000, () => {
	console.log('LISTENING ON PORT 3000'.bgGrey);
});
