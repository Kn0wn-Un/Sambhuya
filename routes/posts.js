var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController');
/* GET users listing. */
router.get('/display-post/:postId', function (req, res, next) {
	res.render('index', { title: 'posts', userid: req.params.postId });
});

router.get('/', (req, res, err) => {
	res.send('hello');
});

router.get('/new-post', postController.postFormGet);

router.post('/new-post', postController.postFormPost);

module.exports = router;
