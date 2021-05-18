var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const indexController = require('../controllers/indexController');
const passport = require('passport');

/* GET home page. */
router.get('/', indexController.homeGet);

router.post('/', indexController.homePost);

router.get('/login', userController.userLoginGet);

router.post('/login', userController.userLoginPost);

router.get('/logout', userController.userLogout);

router.get('/sign-up', userController.userSignupGet);

router.post('/sign-up', userController.userSignupPost);
module.exports = router;
