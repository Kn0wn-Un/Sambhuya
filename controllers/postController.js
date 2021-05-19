const Post = require('../models/post');
const Location = require('../models/location');
const HelpType = require('../models/helptype');
const { body, validationResult } = require('express-validator');
const async = require('async');

exports.postFormGet = (req, res, next) => {
	if (!req.user) {
		res.redirect('/login');
		return;
	}
	async.parallel(
		{
			locations: function (callback) {
				Location.find({}).exec(callback);
			},
			helpType: function (callback) {
				HelpType.find({}).exec(callback);
			},
		},
		(err, results) => {
			if (err) return next(err);
			res.render('post_form', {
				title: 'New Post',
				head: 'New Post',
				userid: req.user._id,
				locations: results.locations,
				helpType: results.helpType,
			});
			return;
		}
	);
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
	body('phone').custom((value) => {
		if (/[7-9][0-9]{9}/.test(value)) {
			return true;
		}
		throw new Error('Invalid Phone number');
	}),
	(req, res, next) => {
		if (!req.user) {
			res.redirect('/login');
			return;
		}
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			async.parallel(
				{
					locations: function (callback) {
						Location.find({}).exec(callback);
					},
					helpType: function (callback) {
						HelpType.find({}).exec(callback);
					},
				},
				(err, results) => {
					if (err) return next(err);
					res.render('post_form', {
						title: 'New Post',
						head: 'New Post',
						userid: req.user._id,
						locations: results.locations,
						helpType: results.helpType,
						errors: errors.array(),
					});
					return;
				}
			);
		}
		//check if phone already exists
		Post.findOne({ phone: req.body.phone }).exec(function (err, post) {
			if (err) return next(err);
			else if (post !== null) {
				async.parallel(
					{
						locations: function (callback) {
							Location.find({}).exec(callback);
						},
						helpType: function (callback) {
							HelpType.find({}).exec(callback);
						},
					},
					(err, results) => {
						if (err) return next(err);
						res.render('post_form', {
							title: 'New Post',
							head: 'New Post',
							userid: req.user._id,
							locations: results.locations,
							helpType: results.helpType,
							phoneErr: post.url,
						});
						return;
					}
				);
			} else {
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
		.populate('helpType')
		.populate('location')
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
	async.parallel(
		{
			locations: function (callback) {
				Location.find({}).exec(callback);
			},
			helpType: function (callback) {
				HelpType.find({}).exec(callback);
			},
			post: function (callback) {
				Post.findById(req.params.postId)
					.populate('user')
					.populate('helpType')
					.populate('location')
					.exec(callback);
			},
		},
		(err, results) => {
			if (err) return next(err);
			res.render('post_form', {
				title: 'Edit Post',
				head: 'Edit Post',
				userid: req.user._id,
				locations: results.locations,
				helpType: results.helpType,
				post: results.post,
			});
			return;
		}
	);
};

exports.postFormEditPost = [
	body('phone')
		.trim()
		.isLength({ min: 10, max: 10 })
		.escape()
		.withMessage('Phone Number must be specified.')
		.isNumeric()
		.withMessage('Phone must have only numbers.'),
	body('phone').custom((value) => {
		if (/[7-9][0-9]{9}/.test(value)) {
			return true;
		}
		throw new Error('Invalid Phone number');
	}),
	(req, res, next) => {
		if (!req.user) return res.redirect('/');
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			async.parallel(
				{
					locations: function (callback) {
						Location.find({}).exec(callback);
					},
					helpType: function (callback) {
						HelpType.find({}).exec(callback);
					},
					post: function (callback) {
						Post.findById(req.params.postId)
							.populate('user')
							.populate('helpType')
							.populate('location')
							.exec(callback);
					},
				},
				(err, results) => {
					if (err) return next(err);
					res.render('post_form', {
						title: 'Edit Post',
						head: 'Edit Post',
						userid: req.user._id,
						locations: results.locations,
						helpType: results.helpType,
						post: results.post,
						errors: errors.array(),
					});
					return;
				}
			);
		}
		Post.findOne({ phone: req.body.phone }).exec(function (err, post) {
			var samePost = false;
			if (err) return next(err);
			else if (post !== null) {
				if (String(req.params.postId) === String(post._id))
					samePost = true;
				else {
					async.parallel(
						{
							locations: function (callback) {
								Location.find({}).exec(callback);
							},
							helpType: function (callback) {
								HelpType.find({}).exec(callback);
							},
						},
						(err, results) => {
							if (err) return next(err);
							res.render('post_form', {
								title: 'Edit Post',
								head: 'Edit Post',
								userid: req.user._id,
								locations: results.locations,
								helpType: results.helpType,
								post: post,
								phoneErr: post.url,
							});
							return;
						}
					);
				}
			}
			if (post === null || samePost) {
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

exports.postDelete = (req, res, next) => {
	if (!req.user) return res.redirect('/');
	Post.findByIdAndRemove(req.params.postId).exec((err, del) => {
		if (err) return next(err);
		else res.redirect('/user');
	});
};
