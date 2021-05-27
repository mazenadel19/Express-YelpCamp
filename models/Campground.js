const mongoose = require('mongoose');
const colors = require('colors');
const Review = require('./Review');

const { Schema } = mongoose;

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/h_200,w_200');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema(
	{
		campNo: String,
		description: String,
		images: [ImageSchema],
		geometry: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
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
	},
	opts,
);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `
	<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
	<p>${this.description.substring(0, 20)}...</p>`;
});

campgroundSchema.post('findOneAndDelete', async function (doc) {
	if (doc) {
		const res = await Review.deleteMany({ _id: { $in: doc.reviews } });
	}
});

module.exports = mongoose.model('Campground', campgroundSchema);
