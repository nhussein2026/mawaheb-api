  const Semester = require('../models/Semester');
  const University = require('../models/University');

  const semesterController = {
    updateSemester: async (req, res) => {
      try {
        const { semesterId } = req.params;
        const updates = req.body;

        const updatedSemester = await Semester.findByIdAndUpdate(semesterId, updates, { new: true });
        res.status(200).json({ message: 'Semester updated', updatedSemester });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    },

    deleteSemester: async (req, res) => {
      try {
        const { semesterId, universityId } = req.params;

        await Semester.findByIdAndDelete(semesterId);

        const university = await University.findById(universityId);
        university.semesters.pull(semesterId);

        let totalGPA = 0;
        for (let semId of university.semesters) {
          const sem = await Semester.findById(semId);
          totalGPA += sem.semesterGPA;
        }

        university.totalGPA = university.semesters.length ? (totalGPA / university.semesters.length) : 0;
        await university.save();

        res.status(200).json({ message: 'Semester deleted', university });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    }
  };

  module.exports = semesterController;
