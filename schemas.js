const Joi = require('joi'); // joi is tool used to validate your js code

module.exports.campgroundSchema = Joi.object({
	// this is not related to mongoose schema it's pattern for js object used for validation
	campground: Joi.object({
		title: Joi.string().required(),
		location: Joi.string().required(),
		image: Joi.string().required(),
		price: Joi.number().required().min(0), // number() not string()
		description: Joi.string().required(),
	}).required(),
});

module.exports.reviewSchema = Joi.object({
	// this is not related to mongoose schema it's pattern for js object used for validation
	review: Joi.object({
		rating: Joi.number().required().min(1).max(5), // number() not string()
		body: Joi.string().required(),
	}).required(),
});
