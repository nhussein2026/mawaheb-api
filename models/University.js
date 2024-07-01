const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentId: { type: String },
  universityName: { type: String, required: true },
  universityType: { type: String, enum: ["Public", "Private"], required: true },
  totalGPA: { type: Number },
  semesters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Semester" }],
  scholarshipStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ScholarshipStudent",
  },
});

const University = mongoose.model("University", universitySchema);

module.exports = University;
