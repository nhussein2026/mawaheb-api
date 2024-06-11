const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const isAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ user: req.user._id });
        if (!admin) return res.status(403).json({ message: 'Access denied: Not an admin' });
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const isEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee) return res.status(403).json({ message: 'Access denied: Not an employee' });
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { authenticateToken, isAdmin, isEmployee };
