var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController');
/* GET users listing. */
router.get('/display-post/:postId', postController.postGet);

router.get('/new-post', postController.postFormGet);

router.post('/new-post', postController.postFormPost);

router.get('/edit/:postId', postController.postFormEditGet);

router.post('/edit/:postId', postController.postFormEditPost);

router.get('/delete/:postId', postController.postDelete);
module.exports = router;
