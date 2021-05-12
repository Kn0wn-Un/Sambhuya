var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:userId', function (req, res, next) {
	res.render('index', { title: 'User page', userid: req.params.userId });
});
module.exports = router;
