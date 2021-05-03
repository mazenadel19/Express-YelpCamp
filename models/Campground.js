const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const Review = require('./Review');

const { Schema } = mongoose;

const campgroundSchema = new Schema({
	campNo: String,
	description: String,
	image: String,
	location: String,
	price: Number,
	title: String,
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
