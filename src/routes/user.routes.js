const router = require('express').Router();

const userController = require('../controllers/user.controller');
const validateObjectId = require('../middlewares/validateObjectId');

router.post('/', userController.createUser);
router.get('/', userController.listUsers);
router.get('/:id', validateObjectId, userController.getUser);

module.exports = router;