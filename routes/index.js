var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Home' });
});

router.get('/login', function (req, res, next) {
	res.render('index', { title: 'login' });
});

router.get('/sign-up', function (req, res, next) {
	res.render('index', { title: 'sign-up' });
});

module.exports = router;
