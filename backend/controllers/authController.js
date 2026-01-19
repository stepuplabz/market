const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.register = async (req, res) => {
    console.log('Register endpoint called with:', req.body);
    try {
        const { phone, password, name, address } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            phone,
            password: hashedPassword,
            name,
            address,
            role: 'user'
        });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                role: user.role,
                address: user.address,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                role: user.role,
                address: user.address,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        user.name = name || user.name;
        // Phone update logic requires unique check, skipping for simplicity unless requested
        // user.phone = phone || user.phone; 

        await user.save();

        res.json({
            id: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role,
            address: user.address
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        // ID remains unchanged as we are only updating properties of the existing record.

        res.json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
