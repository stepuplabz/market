const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const Category = require('./Category');
const Address = require('./Address');

// Define associations if needed
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
// User.hasMany(Address, { foreignKey: 'userId' }); // Optional: if we want relation

module.exports = {
    sequelize,
    User,
    Product,
    Order,
    Category,
    Address
};
