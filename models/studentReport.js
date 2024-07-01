const mongoose = require("mongoose");

const studentReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
  difficultiesId: { type: mongoose.Schema.Types.ObjectId, ref: "Difficulty" },
  userAchievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAchievement",
  },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  date_of_report: { type: Date },
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
  createdAt: { type: Date, default: Date.now },
});

const studentReport = mongoose.model("studentReport", studentReportSchema);

module.exports = studentReport;
