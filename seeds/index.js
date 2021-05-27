const colors = require('colors');
const mongoose = require('mongoose');
const Campground = require('../models/Campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// atlas seeds using the url instead of dbUrl since process.env.DB_URL is undefined on my local machine
// console.log(dbUrl);

mongoose
	.connect(dbUrl, {
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
	for (let i = 1; i <= 300; i++) {
		const rand1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;

		const camp = new Campground({
			campNo: `#${i}`,
			// author: '609cb8ba60aa6df217ad82a4', // local
			author: '60ae8cd334192b7565a69fef', // atlas
			images: [
				{
					url: 'https://res.cloudinary.com/skywa1ker/image/upload/w_570/v1621939821/YelpCamp/wk4ybn0w0vvqnyn72qrb.jpg',
					filename: 'YelpCamp/wk4ybn0w0vvqnyn72qrb',
				},
				{
					url: 'https://res.cloudinary.com/skywa1ker/image/upload/w_570/v1621939744/YelpCamp/ehvtazwtd9jyjha5nrrs.jpg',
					filename: 'YelpCamp/ehvtazwtd9jyjha5nrrs',
				},
			],
			geometry: {
				type: 'Point',
				coordinates: [cities[rand1000].longitude, cities[rand1000].latitude],
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
