const Difficulty = require('../models/Difficulty');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads (if needed)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('difficulty_image'); // Adjust if you want to handle images

const difficultyController = {
    createDifficulty: async (req, res) => {
        try {
            const { title, description } = req.body;
            const userId = req.user.id; // Extract user ID from authenticated middleware

            const difficulty = new Difficulty({
                title,
                description,
                user: userId
            });

            await difficulty.save();
            res.status(201).json({ message: 'Difficulty created successfully', difficulty });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getDifficulties: async (req, res) => {
        try {
            const difficulties = await Difficulty.find({ user: req.user.id });
            res.status(200).json(difficulties);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getDifficultyById: async (req, res) => {
        try {
            const difficulty = await Difficulty.findById(req.params.id);
            if (!difficulty || difficulty.user.toString() !== req.user.id.toString()) {
                return res.status(404).json({ message: 'Difficulty not found' });
            }
            res.status(200).json(difficulty);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateDifficulty: async (req, res) => {
        try {
            const { title, description } = req.body;
            const difficulty = await Difficulty.findById(req.params.id);

            if (!difficulty || difficulty.user.toString() !== req.user.id.toString()) {
                return res.status(404).json({ message: 'Difficulty not found' });
            }

            difficulty.title = title || difficulty.title;
            difficulty.description = description || difficulty.description;

            await difficulty.save();
            res.status(200).json({ message: 'Difficulty updated successfully', difficulty });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    deleteDifficulty: async (req, res) => {
        try {
            const difficulty = await Difficulty.findById(req.params.id);

            if (!difficulty || difficulty.user.toString() !== req.user.id.toString()) {
                return res.status(404).json({ message: 'Difficulty not found' });
            }

            await difficulty.remove();
            res.status(200).json({ message: 'Difficulty deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = difficultyController;
