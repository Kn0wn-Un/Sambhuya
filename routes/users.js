var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
	if (req.user) res.redirect('/user/' + req.user._id);
	else res.redirect('/');
});
router.get('/:userId', function (req, res, next) {
	res.render('user_home_page', {
		title: 'Home:' + req.user.name,
	});
});
module.exports = router;
