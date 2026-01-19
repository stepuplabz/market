const Address = require('../models/Address');

exports.getMyAddresses = async (req, res) => {
    try {
        const addresses = await Address.findAll({ where: { userId: req.user.id } });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { title, address, city, district } = req.body;
        const newAddress = await Address.create({
            userId: req.user.id,
            title,
            address,
            city,
            district
        });
        res.status(201).json(newAddress);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await Address.findOne({ where: { id, userId: req.user.id } });

        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }

        await address.destroy();
        res.json({ message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
