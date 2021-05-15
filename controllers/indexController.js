const Post = require('../models/post');
const Location = require('../models/location');
const HelpType = require('../models/helptype');
const async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;

exports.homeGet = (req, res, next) => {
	async.parallel(
		{
			locations: function (callback) {
				Location.find({}).exec(callback);
			},
			helpType: function (callback) {
				HelpType.find({}).exec(callback);
			},
			posts: function (callback) {
				Post.find({})
					.populate('helpType')
					.populate('location')
					.sort({ posted: -1 })
					.exec(callback);
			},
		},
		(err, results) => {
			if (err) return next(err);
			res.render('index', {
				title: 'Home',
				locations: results.locations,
				helpType: results.helpType,
				posts: results.posts,
				selectedLoc: 'all',
				selectedHelp: 'all',
			});
			return;
		}
	);
};

exports.homePost = (req, res, next) => {
	async.parallel(
		{
			locations: function (callback) {
				Location.find({}).exec(callback);
			},
			helpType: function (callback) {
				HelpType.find({}).exec(callback);
			},
			posts: function (callback) {
				Post.find()
					.populate('helpType')
					.populate('location')
					.sort({ posted: -1 })
					.exec(callback);
			},
		},
		(err, results) => {
			if (err) return next(err);
			var filterPosts = [];
			if (!!req.body.location && !!req.body.helptype) {
				for (var i = 0; i < results.posts.length; i++)
					if (
						results.posts[i].helpType.type === req.body.helptype &&
						results.posts[i].location.cityName === req.body.location
					)
						filterPosts.push(results.posts[i]);
			} else if (!!req.body.location) {
				for (var i = 0; i < results.posts.length; i++)
					if (
						results.posts[i].location.cityName === req.body.location
					)
						filterPosts.push(results.posts[i]);
			} else if (!!req.body.helptype) {
				for (var i = 0; i < results.posts.length; i++)
					if (results.posts[i].helpType.type === req.body.helptype)
						filterPosts.push(results.posts[i]);
			} else filterPosts = results.posts;
			res.render('index', {
				title: 'Home',
				locations: results.locations,
				helpType: results.helpType,
				posts: filterPosts,
				selLoc: req.body.location,
				selHelp: req.body.helptype,
			});
			return;
		}
	);
};
