const User = require('../models/user');
const Post = require('../models/post');
const passwordValidator = require('password-validator');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const async = require('async');
const passport = require('passport');

var schema = new passwordValidator();
schema
	.is()
	.min(8)
	.is()
	.max(25)
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
		.withMessage('Invalid Email.'),
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
		} else {
			passport.authenticate('local', function (err, user, info) {
				if (err) {
					return next(err);
				}
				if (!user) {
					return res.render('user_login', {
						title: 'Login',
						errors: [{ msg: 'Password or Email not found' }],
					});
				}
				req.logIn(user, function (err) {
					if (err) {
						return next(err);
					}
					return res.redirect('/user');
				});
			})(req, res, next);
		}
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
		.custom((value) => !/[0-9]/.test(value))
		.withMessage('No numbers allowed in username'),
	body('phone')
		.trim()
		.isLength({ min: 10, max: 10 })
		.escape()
		.withMessage('Phone Number must be specified.')
		.isNumeric()
		.withMessage('Phone must have only numbers.')
		.isMobilePhone()
		.withMessage('Invaild Phone number.'),
	body('phone').custom((value) => {
		if (/[6-9][0-9]{9}/.test(value)) {
			return true;
		}
		throw new Error('Invalid Phone number');
	}),
	body('email')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Email must be specified.')
		.isEmail()
		.withMessage('Invalid Email.'),
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
				if (results.phone !== null)
					return res.render('user_signup', {
						title: 'Sign Up',
						errors: [{ msg: 'Phone number already exists' }],
					});
				else if (results.email !== null)
					return res.render('user_signup', {
						title: 'Sign Up',
						errors: [{ msg: 'Email already exists' }],
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
								return res.redirect('/login');
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
	async.parallel(
		{
			posts: function (callback) {
				Post.find({ user: req.params.userId })
					.populate('user')
					.populate('helpType')
					.populate('location')
					.populate('verified')
					.sort({ posted: -1 })
					.exec(callback);
			},
			user: function (callback) {
				User.findById(req.params.userId).exec(callback);
			},
		},
		function (err, results) {
			if (err) return next(err);
			var verified = 0;
			for (var i = 0; i < results.posts.length; i++) {
				if (!results.posts[i].verified) continue;
				else if (results.posts[i].verified.length === 0) continue;
				else verified++;
			}
			return res.render('user_home_page', {
				title: 'User Page: ' + results.user.name,
				posts: results.posts,
				user: results.user,
				verifiedPosts: verified,
			});
		}
	);
};

exports.userEditGet = (req, res, next) => {
	if (!req.user) return res.redirect('/');
	User.findById(req.params.userId).exec((err, user) => {
		if (err) return next(err);
		return res.render('user_signup', {
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
	body('phone').custom((value) => {
		if (/[6-9][0-9]{9}/.test(value)) {
			return true;
		}
		throw new Error('Invalid Phone number');
	}),
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
		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('user_signup', {
				title: 'Edit User',
				errors: errors.array(),
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
				user: function (callback) {
					User.findById(req.params.userId).exec(callback);
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
					//Create an User object with escaped and trimmed data.
					var user = new User({
						name: req.body.name,
						phone: req.body.phone,
						email: req.body.email,
						password: results.user.password,
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
							return res.redirect(req.user.url);
						}
					);
				}
			}
		);
	},
];

exports.userChangePassword = (req, res, next) => {
	if (!req.user) return res.redirect('/');
	User.findById(req.params.userId).exec((err, user) => {
		if (err) return next(err);
		return res.render('user_change_password', {
			title: 'Change Password:' + user.name,
			user: user,
		});
	});
};

exports.userChangePasswordPost = (req, res, next) => {
	if (!req.user) return res.redirect('/');
	// Extract the validation errors from a request.
	const validateOldPass = schema.validate(req.body.oldpassword);
	const validateNewPass = schema.validate(req.body.newpassword);
	const validateConfirm = schema.validate(req.body.confirm);
	if (!validateOldPass || !validateNewPass || !validateConfirm) {
		// There are password errors. Render form again with sanitized values/errors messages.
		res.render('user_change_password', {
			title: 'Change Password:' + req.user.name,
			passError: 'Password Error',
		});
		return;
	}
	User.findById(req.params.userId).exec((err, user) => {
		if (err) return next(err);
		bcrypt.compare(req.body.oldpassword, user.password, (err, result) => {
			if (err) return next(err);
			if (result) {
				if (req.body.newpassword === req.body.confirm) {
					bcrypt.hash(
						req.body.newpassword,
						10,
						(err, hashedPassword) => {
							if (err) return next(err);
							var newUser = new User({
								name: user.name,
								phone: user.phone,
								email: user.email,
								password: hashedPassword,
								_id: req.params.userId,
							});
							User.findByIdAndUpdate(
								req.params.userId,
								newUser,
								{},
								function (err, upUser) {
									if (err) return next(err);
									res.render('user_change_password', {
										title:
											'Change Password:' + req.user.name,
										toast: 'Password Changed Sucessfully',
									});
								}
							);
						}
					);
					return;
				} else {
					res.render('user_change_password', {
						title: 'Change Password:' + req.user.name,
						passError: 'New Passwords do not match',
					});
					return;
				}
			} else {
				res.render('user_change_password', {
					title: 'Change Password:' + req.user.name,
					passError: 'Old Password incorrect',
				});
				return;
			}
		});
	});
};
