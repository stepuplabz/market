const { Order } = require('../models');

exports.createOrder = async (req, res) => {
    try {
        const { userId, items, totalPrice, address } = req.body;

        const order = await Order.create({
            userId,
            items,
            totalPrice,
            address,
            status: 'pending'
        });

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        // Admin check should be middleware, but assuming route is protected
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Allow user to cancel if pending, or admin anytime (simplified)
        // Ideally check req.user.id vs order.userId or req.user.role == 'admin'

        order.status = 'cancelled';
        await order.save();
        res.json({ message: 'Order cancelled' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
