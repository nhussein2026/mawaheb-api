const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || '8!s4FtKNnA6LqZp2@G$xYs7!jBt4U#m';
const nodemailer = require('nodemailer');
const University = require('../models/University');


// Helper function to handle errors
const handleErrors = (res, errors) => {
  return res.status(400).json({ errors: errors.array() });
};

// Set up nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
      user: 'devlabtest101@gmail.com',
      pass: 'Dev1234#',
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  },
  greetingTimeout: 20000, // 20 seconds
  connectionTimeout: 30000, // 30 seconds
  logger: true,
  debug: true, // show debug output
});



// Create User
exports.createUser = [
  // Validation and sanitization
  body('name').notEmpty().withMessage('name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleErrors(res, errors);
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password: await bcrypt.hash(password, 10),
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

    const { name, email, password, bio, phone_number, date_of_birth, gender, current_education_level, linkedin_link, website, role } = req.body;

    try {
      let user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Only allow admin to update role
      if (role && req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Only admin can update role' });
      }

      // Update user details
      user.name = name || user.name;
      user.email = email || user.email;
      user.password = password || user.password;
      user.bio = bio || user.bio;
      user.phone_number = phone_number || user.phone_number;
      user.date_of_birth = date_of_birth || user.date_of_birth;
      user.gender = gender || user.gender;
      user.current_education_level = current_education_level || user.current_education_level;
      user.linkedin_link = linkedin_link || user.linkedin_link;
      user.website = website || user.website;
      user.role = role || user.role;

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
exports.fetchAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
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

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }

      // Generate a reset token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Set token and expiration on user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Send email
      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
      const mailOptions = {
          to: user.email,
          from: 'devlabtest101@gmail.com',
          subject: 'Password Reset',
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `${resetUrl}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.log("Error sending email: ", error)
              return res.status(500).send('Email could not be sent');
          }
          res.status(200).json({ msg: 'Password reset email sent' });
      });
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
          return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's password and clear reset token fields
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ msg: 'Password reset successful' });
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
  }
};

// Fetch All Users with Summary Information Based on Category

// Fetch Users Summary by Category
exports.fetchUsersSummaryByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    let result = [];

    switch (category) {
      case 'courses':
        result = await User.aggregate([
          {
            $lookup: {
              from: 'courses',
              localField: '_id',
              foreignField: 'userId',
              as: 'courses',
            },
          },
          {
            $project: {
              id: 1,
              name: 1,
              email: 1,
              courseCount: { $size: '$courses' }, // Count of courses enrolled
            },
          },
        ]);
        break;
      case 'certificates':
        result = await User.aggregate([
          {
            $lookup: {
              from: 'certificates',
              localField: '_id',
              foreignField: 'userId',
              as: 'certificates',
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              certificateCount: { $size: '$certificates' }, // Count of certificates
            },
          },
        ]);
        break;
      case 'difficulties':
        result = await User.aggregate([
          {
            $lookup: {
              from: 'difficulties',
              localField: '_id',
              foreignField: 'userId',
              as: 'difficulties',
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              difficultyCount: { $size: '$difficulties' }, // Count of difficulties reported
            },
          },
        ]);
        break;
      case 'events':
        result = await User.aggregate([
          {
            $lookup: {
              from: 'events',
              localField: '_id',
              foreignField: 'userId',
              as: 'events',
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              eventCount: { $size: '$events' }, // Count of events participated
            },
          },
        ]);
        break;
      case 'financialReports':
        result = await User.aggregate([
          {
            $lookup: {
              from: 'financialreports',
              localField: '_id',
              foreignField: 'userId',
              as: 'financialReports',
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              financialReportCount: { $size: '$financialReports' }, // Count of financial reports
            },
          },
        ]);
        break;
      case 'semesters':
        result = await University.aggregate([
          {
            $lookup: {
              from: 'semesters',
              localField: 'userId',
              foreignField: '_id',
              as: 'Semesters',
            },
          },
          {
            $project: {
              _id: 1,
              universityName: 1,
              universityType: 1,
              semesterCount: { $size: '$Semesters' }, // Count of semesters attended
            },
          },
        ]);
        break;
      case 'reports':
        result = await User.aggregate([
          {
            $lookup: {
              from: 'studentreports',
              localField: '_id',
              foreignField: 'userId',
              as: 'reports',
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              reportCount: { $size: '$reports' }, // Count of reports submitted
            },
          },
        ]);
        break;
      case 'tickets':
        result = await User.aggregate([
          {
            $lookup: {
              from: 'Ticket',
              localField: '_id',
              foreignField: 'userId',
              as: 'Tickets',
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              ticketCount: { $size: '$Tickets' }, // Count of tickets raised
            },
          },
        ]);
        break;
      case 'university':
        result = await University.aggregate([
          {
            $project: {
              _id: 1,
              universityName: 1,
              universityType: 1,
              totalGPA: 1,
              semesterCount: { $size: '$semesters' }, // Count of semesters
            },
          },
        ]);
        break;
      case 'userAchievements':
        result = await User.aggregate([
          {
            $lookup: {
              from: 'UserAchievement',
              localField: '_id',
              foreignField: 'userId',
              as: 'Achievements',
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              achievementCount: { $size: '$Achievements' }, // Count of achievements
            },
          },
        ]);
        break;
      default:
        return res.status(400).json({ message: 'Invalid category' });
    }

    res.json({ result });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};