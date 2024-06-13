const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || '8!s4FtKNnA6LqZp2@G$xYs7!jBt4U#m';


// Helper function to handle errors
const handleErrors = (res, errors) => {
  return res.status(400).json({ errors: errors.array() });
};

// Create User
exports.createUser = [
  // Validation and sanitization
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleErrors(res, errors);
    }

    const { username, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        username,
        email,
        passwordHash: await bcrypt.hash(password, 10),
      });

      await user.save();

      res.status(201).json({ msg: 'User created successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
];

// Login User
exports.loginUser = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleErrors(res, errors);
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
          email: user.email
        }
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '100h' }, (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
];

// Update User Info
exports.updateUser = [
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, username, email, affiliation, bio } = req.body;

    try {
      let user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Update user details
      user.name = name || user.name;
      user.username = username || user.username;
      user.email = email || user.email;
      user.affiliation = affiliation || user.affiliation;
      user.bio = bio || user.bio;

      // If a new profile image is uploaded, update the imageUrl
      if (req.file) {
        user.imageUrl = req.file.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes
      }

      await user.save();

      res.json({ msg: 'User updated successfully', user });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
];

// Delete User (Admin Only)
exports.deleteUser = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  try {
    const user = await User.findById(req.params.id);
    console.log("user id: ", user)
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.deleteOne();

    res.json({ msg: 'User deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


// Fetch User Profile
exports.fetchUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Fetch All Researchers
exports.fetchAllResearchers = async (req, res) => {
  try {
    const researchers = await User.find({ role: 'researcher' }).select('-password');
    res.json({ researchers });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


// Fetch User Role
exports.fetchUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('role');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ role: user.role });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Fetch User by ID
exports.fetchUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};
