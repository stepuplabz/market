const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, addressController.getMyAddresses);
router.post('/', protect, addressController.addAddress);
router.delete('/:id', protect, addressController.deleteAddress);

module.exports = router;
