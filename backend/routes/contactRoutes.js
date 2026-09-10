const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.post('/', controller.sendMessage);
router.get('/', protect, allowRoles('admin'), controller.getMessages);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteMessage);

module.exports = router;
