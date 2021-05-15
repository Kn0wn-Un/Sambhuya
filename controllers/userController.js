const User = require('../models/user');
const Post = require('../models/post');
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

exports.userHomePageGet = (req, res, next) => {
	if (!req.user) return res.redirect('/');
	Post.find({ user: req.params.userId })
		.populate('user')
		.populate('helpType')
		.populate('location')
		.sort({ posted: -1 })
		.exec((err, posts) => {
			if (err) return next(err);
			res.render('user_home_page', {
				title: 'User Page:' + req.user.name,
				posts: posts,
				user: req.user,
			});
		});
};

exports.userEditGet = (req, res, next) => {
	if (!req.user) return res.redirect('/');
	User.findById(req.params.userId).exec((err, user) => {
		if (err) return next(err);
		res.render('user_signup', {
			title: 'Edit User:' + user.name,
			user: user,
		});
	});
};

exports.userEditPost = [
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
				if (
					results.email !== null &&
					String(results.email._id) !== String(req.params.userId)
				)
					return res.render('user_signup', {
						title: 'Edit User',
						passError: 'Email already exists',
						user: req.user,
					});
				else if (
					results.phone !== null &&
					String(results.phone._id) !== String(req.params.userId)
				)
					return res.render('user_signup', {
						title: 'Edit User',
						passError: 'Phone number already exists',
						user: req.user,
					});
				else {
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
								_id: req.params.userId,
							});
							User.findByIdAndUpdate(
								req.params.userId,
								user,
								{},
								function (err, user) {
									if (err) {
										return next(err);
									}
									res.redirect(req.user.url);
								}
							);
						}
					);
				}
			}
		);
	},
];
