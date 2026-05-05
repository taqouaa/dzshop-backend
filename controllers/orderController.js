const { Order, User, Product } = require('../models');
const sequelize = require('../config/database');

exports.createOrder = async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'userId and items are required.' });
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found.' });
    }

    const productChecks = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(404).json({ error: `Product ${item.productId} not found.` });
      }
      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ error: `Out of Stock: "${product.title}" only has ${product.stock} units.` });
      }
      productChecks.push({ product, quantity: item.quantity });
    }

    const totalPrice = productChecks.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
    const order = await Order.create({ userId, totalPrice }, { transaction: t });

    for (const { product, quantity } of productChecks) {
      await order.addProduct(product, { through: { quantity }, transaction: t });
      await product.update({ stock: product.stock - quantity }, { transaction: t });
    }

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: Product, through: { attributes: ['quantity'] } },
        { model: User, attributes: ['id', 'name', 'email'] },
      ],
    });
    res.status(201).json(fullOrder);

  } catch (error) {
    if (t && !t.finished) await t.rollback();
    console.error('ORDER ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Product, through: { attributes: ['quantity'] } },
        { model: User, attributes: ['id', 'name', 'email'] },
      ],
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.params.userId },
      include: [{ model: Product, through: { attributes: ['quantity'] } }],
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders.' });
  }
};