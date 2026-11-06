const router = require('express').Router();
const messageController = require('../controllers/message.controller');
const validateObjectId = require('../middlewares/validateObjectId');

router.put('/:id', validateObjectId, messageController.updateMessage);
router.delete('/:id', validateObjectId, messageController.deleteMessage);

module.exports = router;
