const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    barcode: {
        type: DataTypes.STRING,
        unique: true
    },
    category: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    unitType: {
        type: DataTypes.ENUM('piece', 'kg'),
        defaultValue: 'piece'
    },
    imageUrl: {
        type: DataTypes.STRING
    },
    isCampaign: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    salesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Product;
