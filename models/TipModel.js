const mongoose = require("mongoose");

// Define the schema for the tip
const tipSchema = new mongoose.Schema(
	{
		name: String,
		email: String,
		mobileNumber: String,
		address: String,
		typeOfTip: String,
		landmark: String,
		yourMessage: String,
		captchaValue: String,
		fileLink: String,
		ref_no: Number,
		status: Number,
		position: {
			lat: Number,
			lng: Number
		}
	},
	{
		timestamps: true // This option adds createdAt and updatedAt fields
	}
);

// Create and export the mongoose model for the tip
const Tip = mongoose.model("Tip", tipSchema);

module.exports = Tip;
