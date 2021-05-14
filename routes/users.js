var express = require('express');
var router = express.Router();
const Post = require('../models/post');
/* GET users listing. */
router.get('/', function (req, res, next) {
	if (req.user) res.redirect('/user/' + req.user._id);
	else res.redirect('/');
});
router.get('/:userId', function (req, res, next) {
	if (!req.user) res.redirect('/login');
	Post.find({ userId: req.user._id })
		.select('description')
		.sort({ date: 1 })
		.exec((err, results) => {
			if (err) return next(err);
			console.log(results);
			res.render('user_home_page', {
				title: 'Home:' + req.user.name,
				posts: results,
			});
		});
});
module.exports = router;
