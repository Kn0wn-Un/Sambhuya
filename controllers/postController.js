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
				title: 'New Lead',
				head: 'New Lead',
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
		if (/[6-9][0-9]{9}/.test(value)) {
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
						title: 'New Lead',
						head: 'New Lead',
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
							title: 'New Lead',
							head: 'New Lead',
							userid: req.user._id,
							locations: results.locations,
							helpType: results.helpType,
							phoneErr: post.url,
						});
					}
				);
				return;
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
					return res.redirect(req.user.url);
				});
				return;
			}
		});
	},
];

exports.postGet = (req, res, next) => {
	var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	Post.findById(req.params.postId)
		.populate('user')
		.populate('helpType')
		.populate('location')
		.populate('verified')
		.exec((err, post) => {
			if (err) return next(err);
			post.isAuthor = req.user
				? String(req.user._id) === String(post.user._id)
					? true
					: false
				: false;
			var hasVerified = false;
			if (req.user) {
				for (var i = 0; i < post.verified.length; i++)
					if (String(req.user._id) === String(post.verified[i]._id)) {
						hasVerified = req.user._id;
						break;
					}
			}
			return res.render('post_page', {
				title: 'Lead: ' + post.helpType.type,
				post: post,
				share: fullUrl,
				hasVerified: hasVerified,
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
					.populate('verified')
					.exec(callback);
			},
		},
		(err, results) => {
			if (err) return next(err);
			res.render('post_form', {
				title: 'Edit Lead',
				head: 'Edit Lead',
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
		if (/[6-9][0-9]{9}/.test(value)) {
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
							.populate('verified')
							.exec(callback);
					},
				},
				(err, results) => {
					if (err) return next(err);
					res.render('post_form', {
						title: 'Edit Lead',
						head: 'Edit Lead',
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
								title: 'Edit Lead',
								head: 'Edit Lead',
								userid: req.user._id,
								locations: results.locations,
								helpType: results.helpType,
								post: post,
								phoneErr: post.url,
							});
						}
					);
					return;
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
				return;
			}
		});
	},
];

exports.postDelete = (req, res, next) => {
	if (!req.user) return res.redirect('/');
	Post.findByIdAndRemove(req.params.postId).exec((err, del) => {
		if (err) return next(err);
		else return res.redirect('/user');
	});
};

exports.verifyLeadGet = (req, res, next) => {
	if (!req.user) return res.redirect('/login');
	backURL = req.header('Referer') || '/';
	Post.findOne({ _id: req.params.postId })
		.populate('verified')
		.exec(function (err, post) {
			if (err) return next(err);
			if (post === null) {
				return res.redirect(backURL);
			} else if (post.verified.length !== 0) {
				for (var i = 0; i < post.verified.length; i++)
					if (
						String(post.verified[i]._id) ===
						String(req.params.userId)
					) {
						return res.redirect(backURL);
					}
			}
			Post.findByIdAndUpdate(
				req.params.postId,
				{
					$push: {
						verified: req.params.userId,
					},
				},
				{},
				function (err, result) {
					if (err) {
						return next(err);
					}
					return res.redirect(backURL);
				}
			);
		});
};
