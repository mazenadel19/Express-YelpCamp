/* eslint-disable no-console */
const colors = require('colors');
const mongoose = require('mongoose');
const Campground = require('../models/Campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper');

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
	.catch(e => {
		console.log('FAILED CONNECT TO MONGODB!!!'.brightYellow);
		console.log(`${e}.brightYellow`);
	});

function sample(arr) {
	const rand = Math.floor(Math.random() * arr.length);
	return arr[rand];
}

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 1; i <= 50; i++) {
		const rand1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;

		const camp = new Campground({
			campNo: `#${i}`,
			// your user ID ... DONT TOUCH IT!!
			author: '609cb8ba60aa6df217ad82a4',
			images: [
				{
					url: 'https://res.cloudinary.com/skywa1ker/image/upload/v1621404583/YelpCamp/lftn5oviwo1lmmowb2ei.png',
					filename: 'YelpCamp/lftn5oviwo1lmmowb2ei',
				},
				{
					url: 'https://res.cloudinary.com/skywa1ker/image/upload/v1621404582/YelpCamp/rqnpi0drmqqjptlqedyw.jpg',
					filename: 'YelpCamp/rqnpi0drmqqjptlqedyw',
				},
			],
			geometry: {
				type: 'Point',
				coordinates: [-98.8223185136653, 31.8039734986],
			},

			location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			price,
			description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam, similique. Libero illo, officiis officia cum nesciunt accusantium ipsam, excepturi ex aspernatur, accusamus magnam. Porro incidunt dolor quod nesciunt accusamus animi.`,
		});

		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
