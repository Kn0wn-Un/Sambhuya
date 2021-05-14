const User = require('../models/user');
const passwordValidator = require('password-validator');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const async = require('async');

var schema = new passwordValidator();
schema
	.is()
	.min(8)
	.is()
	.max(100)
	.has()
	.uppercase()
	.has()
	.lowercase()
	.has()
	.digits(1)
	.has()
	.not()
	.spaces();

exports.userLoginGet = (req, res, err) => {
	res.render('user_login', { title: 'Login' });
};

exports.userLoginPost = [
	// Validate and sanitize fields.
	body('email')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Email must be specified.')
		.isEmail()
		.withMessage('Email must be proper.'),
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		const validatePass = schema.validate(req.body.password);
		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('user_login', {
				title: 'Login',
				errors: errors.array(),
			});
			return;
		}
		if (!validatePass) {
			// There are password errors. Render form again with sanitized values/errors messages.
			res.render('user_login', {
				title: 'Login',
				passError: 'Password Error',
			});
			return;
		}
		next();
	},
];

exports.userSignupGet = (req, res, err) => {
	res.render('user_signup', { title: 'Sign Up', name: req.body.name });
};

exports.userSignupPost = [
	// Validate and sanitize fields.
	body('name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Name must be specified.')
		.isAlphanumeric()
		.withMessage('Name has non-alphanumeric characters.'),
	body('phone')
		.trim()
		.isLength({ min: 10, max: 10 })
		.escape()
		.withMessage('Phone Number must be specified.')
		.isNumeric()
		.withMessage('Phone must have only numbers.'),
	body('email')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Email must be specified.')
		.isEmail()
		.withMessage('Email must be proper.'),
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		const validatePass = schema.validate(req.body.password);
		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('user_signup', {
				title: 'Sign Up',
				errors: errors.array(),
			});
			return;
		}
		if (!validatePass) {
			// There are password errors. Render form again with sanitized values/errors messages.
			res.render('user_signup', {
				title: 'Sign Up',
				passError: 'Password Error',
			});
			return;
		}
		async.parallel(
			{
				email: function (callback) {
					User.findOne({ email: req.body.email }).exec(callback);
				},
				phone: function (callback) {
					User.findOne({ phone: req.body.phone }).exec(callback);
				},
			},
			//check if email or phone already exists
			function (err, results) {
				if (err) return next(err);
				if (results.email !== null)
					return res.render('user_signup', {
						title: 'Sign Up',
						passError: 'Email already exists',
					});
				else if (results.phone !== null)
					return res.render('user_signup', {
						title: 'Sign Up',
						passError: 'Phone number already exists',
					});
				else {
					// Data from form is valid.
					//Encrypt Password
					bcrypt.hash(
						req.body.password,
						10,
						(err, hashedPassword) => {
							if (err) return next(err);
							//Create an User object with escaped and trimmed data.
							var user = new User({
								name: req.body.name,
								phone: req.body.phone,
								email: req.body.email,
								password: hashedPassword,
							});
							user.save(function (err) {
								if (err) {
									return next(err);
								}
								res.redirect('/login');
							});
						}
					);
				}
			}
		);
	},
];

exports.userLogout = (req, res) => {
	req.logout();
	res.redirect('/');
};
