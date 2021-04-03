const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
	campNo: String,
	description: String,
	image: String,
	location: String,
	price: Number,
	title: String,
});

module.exports = mongoose.model('Campground', campgroundSchema);
