const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Protected routes
router.post('/', authMiddleware, orderController.createOrder);
router.get('/', adminMiddleware, orderController.getAllOrders);
router.get('/user/:userId', authMiddleware, orderController.getUserOrders);

module.exports = router;
