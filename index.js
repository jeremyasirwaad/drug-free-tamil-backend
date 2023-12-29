require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db");
const Tip = require("./models/TipModel");
const axios = require("axios");

const RECAPTCHA_SECRET_KEY = "6LcpSj8pAAAAABZ0nmLbhNxDM1hQ0nXKo7YI80xR";

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
		yourMessage,
		captchaValue,
		fileLink,
		position
	} = req.body;

	// console.log(req.body);
	// return;
	if (!captchaValue) {
		return res
			.status(400)
			.json({ success: false, message: "reCAPTCHA token is missing." });
	}

	try {
		const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaValue}`;

		const response = await axios.post(verificationURL);

		if (response.data.success) {
			const count = await Tip.countDocuments({});
			const seed = 100000;
			const ref_no = 100000 + count + 1;
			const newTip = new Tip({
				name,
				email,
				mobileNumber,
				address,
				typeOfTip,
				landmark,
				yourMessage,
				fileLink,
				position,
				ref_no
			});

			try {
				await newTip.save();

				res.json({
					success: true,
					message: "Form submitted successfully",
					ref_no: ref_no
				});
			} catch (error) {
				console.error("Error submitting form:", error);
				res
					.status(500)
					.json({ success: false, message: "Internal Server Error" });
			}
		} else {
			res
				.status(403)
				.json({ success: false, message: "reCAPTCHA verification failed." });
		}
	} catch (error) {
		console.error("reCAPTCHA verification error:", error);
		res.status(500).json({ success: false, message: "Internal server error." });
	}
});

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
