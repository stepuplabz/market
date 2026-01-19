const { Category } = require('../models');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    console.log('createCategory called with:', req.body);
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        console.error('createCategory error:', error);
        res.status(400).json({ error: error.message });
    }
};
