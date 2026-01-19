const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'market_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false
    }
);

module.exports = sequelize;
