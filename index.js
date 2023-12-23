require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db");
const Tip = require("./models/TipModel");

// database connection
connection();

app.use(express.json());
app.use(cors());

app.post("/submit-tip", async (req, res) => {
	const {
		name,
		email,
		mobileNumber,
		address,
		typeOfTip,
		landmark,
		yourMessage
	} = req.body;

	// Create a new tip instance using the imported Tip model
	const newTip = new Tip({
		name,
		email,
		mobileNumber,
		address,
		typeOfTip,
		landmark,
		yourMessage
	});

	try {
		// Save the tip to the database
		await newTip.save();

		// Assuming a successful response for now
		res.json({ success: true, message: "Form submitted successfully" });
	} catch (error) {
		console.error("Error submitting form:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
});

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
