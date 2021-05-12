var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:postId', function (req, res, next) {
	res.render('index', { title: 'posts', userid: req.params.postId });
});

module.exports = router;
