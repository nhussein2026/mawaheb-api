const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticated } = require('../middlewares/authMiddleware');

// Register a new user
router.post('/register', userController.createUser);

// Login
router.post('/login', userController.loginUser);

// Get all users
router.get('/users', authenticated, userController.fetchAllResearchers);

// Get a user by ID
router.get('/users/:id', authenticated, userController.fetchUserById);

// Update a user by ID
router.put('/users/:id', authenticated, userController.updateUser);

// Delete a user by ID
router.delete('/users/:id', authenticated, userController.deleteUser);

module.exports = router;
