var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'user-home-page' });
});

router.get('/login', function (req, res, next) {
	res.render('index', { title: 'login' });
});

router.get('/sign-up', function (req, res, next) {
	res.render('index', { title: 'sign-up' });
});

module.exports = router;
