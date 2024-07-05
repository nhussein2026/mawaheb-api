const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticated } = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads' }); // set up Multer

// Register a new user
router.post('/register', userController.createUser);

// Login
router.post('/login', userController.loginUser);

// Get all users
router.get('/users', authenticated, userController.fetchAllUsers);

// summary of user data
router.get('/summary/', authenticated, userController.fetchUsersSummaryByCategory);

// Get a user by ID
router.get('/users/:id', authenticated, userController.fetchUserById);

// Update a user by ID
router.put('/update-profile', authenticated, upload.single('profileImage'), userController.updateUser);

// Delete a user by ID
router.delete('/users/:id', authenticated, userController.deleteUser);

//user profile endpoint
router.get('/profile', authenticated, userController.fetchUserProfile);

// Forgot password
router.post('/forgot-password', userController.forgotPassword);

// Reset password
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;
