const sequelize = require('../config/database');
const User = require('./User');
const Order = require('./Order');
const Product = require('./Product');

// One User has many Orders
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Many-to-Many: Order <-> Product via OrderItems junction table
Order.belongsToMany(Product, {
  through: 'OrderItems',
  foreignKey: 'orderId',
  otherKey: 'productId',
});
Product.belongsToMany(Order, {
  through: 'OrderItems',
  foreignKey: 'productId',
  otherKey: 'orderId',
});

module.exports = { sequelize, User, Order, Product };
