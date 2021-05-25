const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const Campground = require('../models/Campground');

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary/index');

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({}).populate('author');
	res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1,
		})
		.send();
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features[0].geometry; // returns geojson .. this is how it looks => { type: 'Point', coordinates: [ 31.23944, 30.05611 ] }

	campground.images = req.files.map(f => ({
		// req.files is added by multer
		url: f.path,
		filename: f.filename,
	}));
	campground.author = req.user._id;
	await campground.save();
	console.log(campground);
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
	// console.log(req.body);
	const campground = await Campground.findByIdAndUpdate(
		id,
		{ ...req.body.campground },
		{
			new: true,
			runValidators: true,
		},
	);
	const imgs = req.files.map(f => ({
		// req.files is added by multer
		url: f.path,
		filename: f.filename,
	}));
	campground.images.push(...imgs);
	await campground.save();
	// console.log(campground);

	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
		console.log(campground);
	}

	req.flash('success', 'Successfully Updated Campground!');
	res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findByIdAndDelete(id);
	// console.log(camp, 'was deleted successfully'.blue);
	req.flash('success', 'Successfully Deleted Campground!');
	res.redirect(`/campgrounds`);
};
