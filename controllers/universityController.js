const University = require("../models/University");
const Semester = require("../models/Semester");

const universityController = {
  createUniversityRecord: async (req, res) => {
    try {
      const {
        studentId,
        universityName,
        universityType,
        scholarshipStudentId,
      } = req.body;
      const user = req.user.id;
      const newUniversityRecord = new University({
        userId: user,
        studentId,
        universityName,
        universityType,
        scholarshipStudentId,
      });

      await newUniversityRecord.save();
      res
        .status(201)
        .json({
          message: "University record created",
          universityRecord: newUniversityRecord,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  addSemester: async (req, res) => {
    try {
      const { universityId, semesterNumber, courses, resultImage } = req.body;

      const newSemester = new Semester({
        semesterNumber,
        courses,
        resultImage,
      });
      let totalCredits = 0;
      let totalPoints = 0;

      courses.forEach((course) => {
        totalCredits += course.credits;
        totalPoints += course.grade * course.credits;
      });

      newSemester.semesterGPA = totalCredits ? totalPoints / totalCredits : 0;
      await newSemester.save();

      const university = await University.findById(universityId);
      university.semesters.push(newSemester._id);

      let totalGPA = 0;
      for (let semId of university.semesters) {
        const sem = await Semester.findById(semId);
        totalGPA += sem.semesterGPA;
      }

      university.totalGPA = university.semesters.length
        ? totalGPA / university.semesters.length
        : 0;
      await university.save();

      res
        .status(201)
        .json({ message: "Semester added", semester: newSemester, university });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getUniversityRecord: async (req, res) => {
    try {
      const { universityId } = req.params;
      const universityRecord = await University.findById(universityId).populate(
        "semesters"
      );

      res.status(200).json({ universityRecord });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateUniversityRecord: async (req, res) => {
    try {
      const { universityId } = req.params;
      const updates = req.body;

      const universityRecord = await University.findByIdAndUpdate(
        universityId,
        updates,
        { new: true }
      ).populate("semesters");
      res
        .status(200)
        .json({ message: "University record updated", universityRecord });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  deleteUniversityRecord: async (req, res) => {
    try {
      const { universityId } = req.params;

      const universityRecord = await University.findById(universityId);
      if (!universityRecord) {
        return res.status(404).json({ message: "University record not found" });
      }

      for (let semesterId of universityRecord.semesters) {
        await Semester.findByIdAndDelete(semesterId);
      }

      await University.findByIdAndDelete(universityId);
      res.status(200).json({ message: "University record deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = universityController;
