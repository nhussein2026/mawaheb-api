const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true },
  courses: [{
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    grade: { type: Number, required: true },
    credits: { type: Number, required: true },
    ects: { type: Number, required: true }, // ECTS field
    lg: { type: String, enum: ['AA', 'AB', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FF'], required: true } // LG field
  }],
  resultImage: { type: String },
  semesterGPA: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

});

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
