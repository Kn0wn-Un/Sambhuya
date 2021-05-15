var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const user = require('../models/user');
const userController = require('../controllers/userController');
/* GET users listing. */
router.get('/', function (req, res, next) {
	req.user ? res.redirect('/user/' + req.user._id) : res.redirect('/');
});

router.get('/:userId', userController.userHomePageGet);

router.get('/edit/:userId', userController.userEditGet);

router.post('/edit/:userId', userController.userEditPost);

module.exports = router;
