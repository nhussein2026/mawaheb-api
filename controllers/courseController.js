const Course = require('../models/Course');
const multer = require('multer');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // File name
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter 
}).single('course_image'); // Expect a single file with field name 'course_image'

const courseController = {
    createCourse: (req, res) => {
        upload(req, res, async (err) => {
            const user = req.user.id;
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            const { title, description } = req.body;
            const course_image = req.file ? req.file.filename : null;

            try {
                const course = new Course({
                    title,
                    description,
                    course_image,
                    user
                });
                await course.save();
                res.status(201).json({ message: 'Course created successfully', course });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Server error' });
            }
        });
    },

    getCourses: async (req, res) => {
        try {
            const courses = await Course.find().populate('user', 'name email');
            res.json(courses);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getCourseById: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id).populate('user', 'name email');
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.json(course);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateCourse: (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            const { title, description, user } = req.body;
            const course_image = req.file ? req.file.filename : null;

            try {
                const updateData = { title, description, user };
                if (course_image) updateData.course_image = course_image;

                const updatedCourse = await Course.findByIdAndUpdate(
                    req.params.id,
                    updateData,
                    { new: true }
                ).populate('user', 'name email');
                if (!updatedCourse) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                res.json({ message: 'Course updated successfully', updatedCourse });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Server error' });
            }
        });
    },

    deleteCourse: async (req, res) => {
        try {
            const deletedCourse = await Course.findByIdAndDelete(req.params.id);
            if (!deletedCourse) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.json({ message: 'Course deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = courseController;
