const Post = require('../models/post');
const { body, validationResult } = require('express-validator');

exports.postFormGet = (req, res) => {
	if (!req.user) res.redirect('/login');
	console.log('test');
	res.render('post_form', {
		title: 'New Post',
		userid: req.user._id,
		locations: ['Bengaluru', 'Mumbai', 'Goa', 'Chennai'],
		helpType: [
			'Masks',
			'Oxygen Beds',
			'Respirators',
			'Hospital Beds',
			'Plasma Donors',
		],
	});
	return;
};

exports.postFormPost = [
	// Validate and sanitize fields.
	body('phone')
		.trim()
		.isLength({ min: 10, max: 10 })
		.escape()
		.withMessage('Phone Number must be specified.')
		.isNumeric()
		.withMessage('Phone must have only numbers.'),
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.render('post_form', {
				title: 'New Post',
				userid: req.user._id,
				locations: ['Bengaluru', 'Mumbai', 'Goa', 'Chennai'],
				helpType: [
					'Masks',
					'Oxygen Beds',
					'Respirators',
					'Hospital Beds',
					'Plasma Donors',
				],
				errors: errors.array(),
			});
			return;
		}
		//check if phone already exists
		Post.findOne({ phone: req.body.phone }).exec(function (err, results) {
			if (err) return next(err);
			else if (results !== null)
				res.render('post_form', {
					title: 'New Post',
					userid: req.user._id,
					locations: ['Bengaluru', 'Mumbai', 'Goa', 'Chennai'],
					helpType: [
						'Masks',
						'Oxygen Beds',
						'Respirators',
						'Hospital Beds',
						'Plasma Donors',
					],
					passError: 'Phone number already exists',
				});
			else {
				// Data from form is valid.
				//Create an Post object with escaped and trimmed data.
				var post = new Post({
					phone: req.body.phone,
					location: req.body.location,
					helpType: req.body.helptype,
					description: req.body.description,
					userId: req.user._id,
				});
				post.save(function (err) {
					if (err) {
						return next(err);
					}
					res.redirect(req.user.url);
				});
			}
		});
	},
];
