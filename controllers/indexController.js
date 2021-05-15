const Post = require('../models/post');

exports.homeGet = (req, res, next) => {
	Post.find({})
		.sort({ posted: 1 })
		.exec((err, posts) => {
			if (err) return next(err);
			res.render('index', {
				title: 'Home',
				posts: posts,
			});
		});
};
