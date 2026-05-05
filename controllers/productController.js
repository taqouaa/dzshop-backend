const { Product } = require('../models');
const { Op } = require('sequelize');

// GET /api/products?page=1&limit=10&category=electronics
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // Build WHERE clause for category filter
    const whereClause = {};
    if (category && category !== 'all') {
      whereClause.category = { [Op.iLike]: `%${category}%` };
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit: limitNumber,
      offset: offset,
      order: [['id', 'ASC']],
    });

    res.status(200).json({
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(count / limitNumber),
      products: rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
};

// POST /api/products  (Admin only - protected)
exports.createProduct = async (req, res) => {
  try {
    const { title, price, description, category, image, stock } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ error: 'Title and price are required.' });
    }

    const product = await Product.create({ title, price, description, category, image, stock });
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map((e) => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to create product.' });
  }
};

// PUT /api/products/:id  (Admin only - protected)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    await product.update(req.body);
    res.status(200).json(product);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map((e) => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to update product.' });
  }
};

// DELETE /api/products/:id  (Admin only - protected)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    await product.destroy();
    res.status(200).json({ message: `Product #${req.params.id} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
};

// POST /api/products/seed  (Criterion 1 - Database Seeding)
exports.seedProducts = async (req, res) => {
  try {
    const seedData = [
      // Electronics (6 products)
      { title: 'Laptop HP 15 inch', price: 799.99, description: 'Intel Core i5, 8GB RAM, 256GB SSD', category: 'electronics', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', stock: 50 },
      { title: 'Samsung Galaxy A54', price: 399.99, description: 'Smartphone 128GB, 5000mAh battery', category: 'electronics', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', stock: 80 },
      { title: 'Sony WH-1000XM5 Headphones', price: 299.99, description: 'Noise cancelling wireless headphones', category: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', stock: 30 },
      { title: 'Logitech MX Master 3 Mouse', price: 89.99, description: 'Advanced wireless mouse for professionals', category: 'electronics', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', stock: 120 },
      { title: 'Samsung 27" 4K Monitor', price: 449.99, description: 'IPS display, HDR10, 60Hz refresh rate', category: 'electronics', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', stock: 25 },
      { title: 'USB-C Hub 7-in-1', price: 45.99, description: 'HDMI, USB 3.0, SD card reader', category: 'electronics', image: 'https://images.unsplash.com/photo-1618410320928-25228d811631?w=400', stock: 200 },

      // Men Clothing (5 products)
      { title: "Men's Classic Polo Shirt", price: 29.99, description: 'Cotton blend, available in 5 colors', category: "men's clothing", image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400', stock: 150 },
      { title: "Men's Slim Fit Jeans", price: 49.99, description: 'Dark blue stretch denim, modern cut', category: "men's clothing", image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400', stock: 90 },
      { title: "Men's Leather Jacket", price: 159.99, description: 'Genuine leather, warm lining', category: "men's clothing", image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', stock: 40 },
      { title: "Men's Running Sneakers", price: 79.99, description: 'Lightweight, breathable mesh upper', category: "men's clothing", image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', stock: 60 },
      { title: "Men's Formal Dress Shirt", price: 39.99, description: 'Wrinkle-resistant, button-down collar', category: "men's clothing", image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', stock: 110 },

      // Women Clothing (5 products)
      { title: "Women's Summer Dress", price: 55.99, description: 'Floral print, midi length, breathable fabric', category: "women's clothing", image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', stock: 75 },
      { title: "Women's Yoga Pants", price: 34.99, description: 'High waist, 4-way stretch, moisture-wicking', category: "women's clothing", image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', stock: 130 },
      { title: "Women's Cashmere Sweater", price: 89.99, description: '100% cashmere, crew neck, soft texture', category: "women's clothing", image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400', stock: 45 },
      { title: "Women's Ankle Boots", price: 99.99, description: 'Suede finish, block heel, side zipper', category: "women's clothing", image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', stock: 55 },
      { title: "Women's Handbag", price: 69.99, description: 'Vegan leather, multiple compartments', category: "women's clothing", image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', stock: 85 },

      // Jewelry (4 products)
      { title: 'Gold Plated Necklace', price: 129.99, description: '18K gold plated, pendant with cubic zirconia', category: 'jewelery', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', stock: 35 },
      { title: 'Sterling Silver Ring', price: 49.99, description: '925 sterling silver, adjustable band', category: 'jewelery', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', stock: 70 },
      { title: 'Diamond Stud Earrings', price: 199.99, description: '0.25ct diamond, white gold setting', category: 'jewelery', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', stock: 20 },
      { title: 'Rose Gold Bracelet', price: 79.99, description: 'Rose gold plated, charm bracelet', category: 'jewelery', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400', stock: 60 },
    ];

    // Delete existing and re-seed
    await Product.destroy({ where: {} });
    const products = await Product.bulkCreate(seedData);

    res.status(201).json({
      message: `Database seeded successfully with ${products.length} products.`,
      count: products.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Seeding failed.' });
  }
};
