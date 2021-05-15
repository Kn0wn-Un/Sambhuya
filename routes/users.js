var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const user = require('../models/user');
/* GET users listing. */
router.get('/', function (req, res, next) {
	if (req.user) res.redirect('/user/' + req.user._id);
	else res.redirect('/');
});
router.get('/:userId', function (req, res, next) {
	Post.find({ user: req.params.userId })
		.populate('user')
		.sort({ date: 1 })
		.exec((err, posts) => {
			if (err) return next(err);
			var user = posts[0].user;
			res.render('user_home_page', {
				title: 'User Page:' + user.name,
				posts: posts,
				user: user,
			});
		});
});
module.exports = router;
