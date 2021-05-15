const Post = require('../models/post');
const Location = require('../models/location');
const HelpType = require('../models/helptype');

exports.homeGet = (req, res, next) => {
	Post.find({})
		.populate('helpType')
		.populate('location')
		.sort({ posted: -1 })
		.exec((err, posts) => {
			if (err) return next(err);
			res.render('index', {
				title: 'Home',
				posts: posts,
			});
		});
};
