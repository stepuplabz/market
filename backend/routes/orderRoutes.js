const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this exists

router.post('/', orderController.createOrder);
router.get('/user/:userId', orderController.getUserOrders);

// Admin / Management routes
router.get('/', protect, orderController.getAllOrders);
router.put('/:id/status', protect, orderController.updateOrderStatus);
router.post('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
