const StudentReport = require('../models/studentReport');
const Course = require('../models/Course');
const Note = require('../models/Note');
const Difficulty = require('../models/Difficulty');
const UserAchievement = require('../models/UserAchievement');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');

const studentReportController = {
  createStudentReport: async (req, res) => {
    try {
      const {
        title,
        courseId,
        noteId,
        difficultiesId,
        userAchievementId,
        eventId,
        date_of_report,
        certificateId,
      } = req.body;

      const newStudentReport = new StudentReport({
        title,
        userId: req.user.id, // Assuming the user ID comes from the authenticated middleware
        courseId,
        noteId,
        difficultiesId,
        userAchievementId,
        eventId,
        date_of_report,
        certificateId,
      });

      await newStudentReport.save();
      res.status(201).json({ message: 'Student report created', studentReport: newStudentReport });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getStudentReports: async (req, res) => {
    try {
      const studentReports = await StudentReport.find({ userId: req.user.id })
        .populate('courseId')
        .populate('noteId')
        .populate('difficultiesId')
        .populate('userAchievementId')
        .populate('eventId')
        .populate('certificateId');

      res.status(200).json({ studentReports });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getStudentReportById: async (req, res) => {
    try {
      const { reportId } = req.params;
      const studentReport = await StudentReport.findById(reportId)
        .populate('courseId')
        .populate('noteId')
        .populate('difficultiesId')
        .populate('userAchievementId')
        .populate('eventId')
        .populate('certificateId');

      if (!studentReport) {
        return res.status(404).json({ message: 'Student report not found' });
      }

      res.status(200).json({ studentReport });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateStudentReport: async (req, res) => {
    try {
      const { reportId } = req.params;
      const updates = req.body;

      const studentReport = await StudentReport.findByIdAndUpdate(reportId, updates, { new: true })
        .populate('courseId')
        .populate('noteId')
        .populate('difficultiesId')
        .populate('userAchievementId')
        .populate('eventId')
        .populate('certificateId');

      if (!studentReport) {
        return res.status(404).json({ message: 'Student report not found' });
      }

      res.status(200).json({ message: 'Student report updated', studentReport });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteStudentReport: async (req, res) => {
    try {
      const { reportId } = req.params;

      const studentReport = await StudentReport.findByIdAndDelete(reportId);

      if (!studentReport) {
        return res.status(404).json({ message: 'Student report not found' });
      }

      res.status(200).json({ message: 'Student report deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  //get option 
  getOptions: async (req, res) => {
    try {
      const [courses, notes, difficulties, userAchievements, events, certificates] = await Promise.all([
        Course.find({}),
        Note.find({}),
        Difficulty.find({}),
        UserAchievement.find({}),
        Event.find({}),
        Certificate.find({})
      ]);

      res.status(200).json({ courses, notes, difficulties, userAchievements, events, certificates });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = studentReportController;
