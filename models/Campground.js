const mongoose = require('mongoose');
const colors = require('colors');
const Review = require('./Review');

const { Schema } = mongoose;

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

// I can only use virtual on a schema!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

ImageSchema.virtual('thumbnail').get(function () {
	// virtual is a derived data from my schema the looks like a real property but it's not stored in my schema
	// it's the same idea of concatenating first and last name to full name without actually storing full name in the db
	return this.url.replace('/upload', '/upload/h_200,w_200');
});

const campgroundSchema = new Schema({
	campNo: String,
	description: String,
	images: [ImageSchema],
	location: String,
	price: Number,
	title: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review',
		},
	],
});

campgroundSchema.post('findOneAndDelete', async function (doc) {
	console.log('the deleted document'.red, doc);
	if (doc) {
		const res = await Review.deleteMany({ _id: { $in: doc.reviews } });
		console.log(res);
	}
});

module.exports = mongoose.model('Campground', campgroundSchema);
