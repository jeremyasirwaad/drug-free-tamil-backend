require("dotenv").config();
const multer = require("multer");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db");
const Tip = require("./models/TipModel");
const axios = require("axios");
const multerS3 = require("multer-s3");
const { S3 } = require("@aws-sdk/client-s3");

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const s3 = new S3({
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY,
		secretAccessKey: process.env.S3_SECRET_KEY
	},

	region: process.env.S3_REGION
});

// database connection
connection();

app.use(express.json());
app.use(cors());

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: "drugfreetamil",
		key: (req, file, cb) => {
			const fileName = `${Date.now()}_${file.originalname}`;
			cb(null, `files/${fileName}`);
		}
	})
});

app.post("/submit-tip", upload.single("file"), async (req, res) => {
	const {
		name,
		email,
		mobileNumber,
		address,
		typeOfTip,
		landmark,
		yourMessage,
		captchaValue,
		position
	} = req.body;

	const fileLink = req.file.location;

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
