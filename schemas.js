// NB:there's a tool called express validator that does the same job as joi plus it sanitize (html escaping) our code to protect us against xss (cross site scripting)

const BaseJoi = require('joi');// joi is tool used to validate your js code

const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
	// this is not related to mongoose schema it's pattern for js object used for validation
	campground: Joi.object({
		title: Joi.string().required().escapeHTML(),
		location: Joi.string().required().escapeHTML(),
		// image: Joi.string().required(),
		price: Joi.number().required().min(0), // number() not string()
		description: Joi.string().required().escapeHTML(),
	}).required(),
	deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
	// this is not related to mongoose schema it's pattern for js object used for validation
	review: Joi.object({
		rating: Joi.number().required().min(1).max(5), // number() not string()
		body: Joi.string().required().escapeHTML(),
	}).required(),
});


