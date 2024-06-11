const mongoose = require('mongoose');

const userReportSchema = new mongoose.Schema({
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    strugglesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Difficulty' },
    userAchievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAchievement' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    createdAt: { type: Date, default: Date.now }
});

const UserReport = mongoose.model('UserReport', userReportSchema);

module.exports = UserReport;
