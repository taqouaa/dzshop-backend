const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Seeding route (can be protected in production)
router.post('/seed', productController.seedProducts);

// Protected routes (Admin only)
router.post('/', adminMiddleware, productController.createProduct);
router.put('/:id', adminMiddleware, productController.updateProduct);
router.delete('/:id', adminMiddleware, productController.deleteProduct);

module.exports = router;
