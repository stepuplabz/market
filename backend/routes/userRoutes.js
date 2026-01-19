const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, userController.getAllUsers);
router.get('/:id', protect, userController.getUserById);

module.exports = router;
