const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
});

userSchema.plugin(passportLocalMongoose); // adds username and password fields to the Schema and checks to make sure that username is unique, also will hash the saved  password in the database

module.exports = mongoose.model('User', userSchema);
