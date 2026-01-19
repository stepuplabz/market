const { Product } = require('../models');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { isDeleted: false }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    console.log('createProduct called with:', req.body);
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error('createProduct error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        await product.update(req.body);
        res.json(product);
    } catch (error) {
        console.error('updateProduct error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        // Soft delete
        await product.update({ isDeleted: true });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('deleteProduct error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.uploadImage = async (req, res) => {
    console.log('uploadImage called');
    try {
        if (!req.file) {
            console.error('No image file in request');
            return res.status(400).json({ error: 'No image uploaded' });
        }
        console.log('Image uploaded:', req.file);
        // Return full URL
        const protocol = req.protocol;
        const host = req.get('host');
        const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({ imageUrl });
    } catch (error) {
        console.error('uploadImage error:', error);
        res.status(500).json({ error: error.message });
    }
};
