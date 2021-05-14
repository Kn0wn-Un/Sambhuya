var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const passport = require('passport');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Home' });
});

router.get('/login', userController.userLoginGet);

router.post(
	'/login',
	userController.userLoginPost,
	passport.authenticate('local', {
		successRedirect: '/user',
		failureRedirect: '/login',
	})
);

router.get('/logout', userController.userLogout);

router.get('/sign-up', userController.userSignupGet);

router.post('/sign-up', userController.userSignupPost);
module.exports = router;
