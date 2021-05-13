const User = require('../models/user');
const passwordValidator = require('password-validator');
const { body, validationResult } = require('express-validator');
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
	res.render('user_login', { title: 'login' });
};

exports.userLoginPost = (req, res, err) => {
	res.render('/index');
};

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
		.isLength({ min: 10, max: 10 })
		.escape()
		.withMessage('Email must be specified.')
		.isEmail()
		.withMessage('Email must have only numbers.'),
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		const validatePass = schema.validate(body('password'));
		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('user_signup', {
				title: 'Sign Up',
				errors: errors.array(),
			});
			return;
		}
		if (!validatePass) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('user_signup', {
				title: 'Sign Up',
				errors: 'Password Error',
			});
			return;
		}
		// Data from form is valid.

		// Create an Author object with escaped and trimmed data.
		var author = new Author({
			first_name: req.body.first_name,
			family_name: req.body.family_name,
			date_of_birth: req.body.date_of_birth,
			date_of_death: req.body.date_of_death,
		});
		author.save(function (err) {
			if (err) {
				return next(err);
			}
			// Successful - redirect to new author record.
			res.redirect(author.url);
		});
	},
];
/*(req, res, err) => {
	/*const user = new User({
		username: req.body.username,
		password: req.body.password,
	}).save((err) => {
		if (err) {
			return next(err);
		}
		res.redirect('/');
	});
	res.redirect('/login');
};*/
