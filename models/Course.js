const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    certificate_photo: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;