const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    deliveryFee: {
        type: DataTypes.FLOAT,
        defaultValue: 29.90
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Order;
