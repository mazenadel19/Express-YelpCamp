const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const Campground = require('../models/Campground');

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary/index');

module.exports.index = async (req, res) => {
  const activePage = req?.query?.page ? parseInt(req.query.page) : 1;
  const resultPerPage = 20;
  const totalCamps = await Campground.countDocuments({});
  const totalPages = totalCamps / resultPerPage;
  const beginning = activePage === 1 ? 1 : resultPerPage * (activePage - 1) + 1
  const end = activePage === totalPages ? totalCamps : beginning + resultPerPage - 1;

	const campgrounds = await Campground.find({})
    .populate("author")
    .skip((activePage - 1) * resultPerPage)
		.limit(resultPerPage);
	res.render("campgrounds/index", {
    campgrounds,
    activePage,
    totalPages,
    results_per_page: resultPerPage,
    total_results: totalCamps,
    beginning,
    end,
  });

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
	campground.geometry = geoData.body.features[0].geometry;

	campground.images = req.files.map(f => ({
		url: f.path,
		filename: f.filename,
	}));
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
	const campground = await Campground.findByIdAndUpdate(
		id,
		{ ...req.body.campground },
		{
			new: true,
			runValidators: true,
		},
	);
	const imgs = req.files.map(f => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.images.push(...imgs);
	await campground.save();

	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}

	req.flash('success', 'Successfully Updated Campground!');
	res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findByIdAndDelete(id);
	req.flash('success', 'Successfully Deleted Campground!');
	res.redirect(`/campgrounds`);
};
