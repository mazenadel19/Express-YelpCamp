const Campground = require('../models/Campground');

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({}).populate('author');
	res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	const campground = new Campground(req.body.campground);
	campground.author = req.user._id;
	await campground.save();

	req.flash('success', 'Successfully Created Campground!');
	res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.showCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await await Campground.findById(id)
		.populate({ path: 'reviews', populate: { path: 'author' } })
		.populate('author');
	if (!campground) {
		req.flash('error', 'Cannot Find That Campground!');
		return res.redirect('/campgrounds');
	}
	// console.log(campground);
	return res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	if (!campground) {
		req.flash('error', 'Cannot Find That Campground!');
		return res.redirect('/campgrounds');
	}
	req.flash('success', 'Successfully Edited Campground!');
	return res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findByIdAndUpdate(
		id,
		{ ...req.body.campground },
		{
			new: true,
			runValidators: true,
		},
	);
	// console.log(camp);
	req.flash('success', 'Successfully Updated Campground!');
	res.redirect(`/campgrounds/${camp.id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findByIdAndDelete(id);
	// console.log(camp, 'was deleted successfully'.blue);
	req.flash('success', 'Successfully Deleted Campground!');
	res.redirect(`/campgrounds`);
};
