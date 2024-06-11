const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Register a new user
router.post('/register', userController.register);

// Login
router.post('/login', userController.login);

// Get all users
router.get('/users', authenticateToken, userController.getUsers);

// Get a user by ID
router.get('/users/:id', authenticateToken, userController.getUserById);

// Update a user by ID
router.put('/users/:id', authenticateToken, userController.updateUser);

// Delete a user by ID
router.delete('/users/:id', authenticateToken, userController.deleteUser);

module.exports = router;
