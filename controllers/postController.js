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
					user: req.user._id,
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

exports.postGet = (req, res, next) => {
	Post.findById(req.params.postId)
		.populate('user')
		.exec((err, post) => {
			if (err) return next(err);
			post.isAuthor = req.user
				? String(req.user._id) === String(post.user._id)
					? true
					: false
				: false;
			res.render('post_page', {
				title: !req.user ? 'post' : req.user.name + ' | post',
				post: post,
			});
		});
};

exports.postFormEditGet = (req, res, next) => {
	if (!req.user) return res.redirect('/');
	Post.findById(req.params.postId).exec((err, post) => {
		if (err) return next(err);
		res.render('post_form', {
			title: 'Edit Post',
			userid: req.user._id,
			locations: ['Bengaluru', 'Mumbai', 'Goa', 'Chennai'],
			helpType: [
				'Masks',
				'Oxygen Beds',
				'Respirators',
				'Hospital Beds',
				'Plasma Donors',
			],
			post: post,
		});
	});
};

exports.postFormEditPost = [
	body('phone')
		.trim()
		.isLength({ min: 10, max: 10 })
		.escape()
		.withMessage('Phone Number must be specified.')
		.isNumeric()
		.withMessage('Phone must have only numbers.'),
	(req, res, next) => {
		if (!req.user) return res.redirect('/');
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
				post: post,
				errors: errors.array(),
			});
			return;
		}
		Post.findOne({ phone: req.body.phone }).exec(function (err, results) {
			var samePost = false;
			if (err) return next(err);
			else if (results !== null) {
				if (String(req.params.postId) === String(results._id))
					samePost = true;
				else
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
			}
			if (results === null || samePost) {
				// Data from form is valid.
				//Create an Post object with escaped and trimmed data.
				var post = new Post({
					phone: req.body.phone,
					location: req.body.location,
					helpType: req.body.helptype,
					description: req.body.description,
					user: req.user,
					_id: req.params.postId,
				});
				Post.findByIdAndUpdate(
					req.params.postId,
					post,
					{},
					function (err, post) {
						if (err) {
							return next(err);
						}
						res.redirect(req.user.url);
					}
				);
			}
		});
	},
];
