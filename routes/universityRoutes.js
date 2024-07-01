const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');
const semesterController = require('../controllers/semesterController');
const { authenticated } = require('../middlewares/authMiddleware');

// University routes
router.post('/university', authenticated, universityController.createUniversityRecord);
router.post('/university/semester', authenticated, universityController.addSemester);
router.get('/university/:universityId', authenticated, universityController.getUniversityRecord);
router.put('/university/:universityId', authenticated, universityController.updateUniversityRecord);
router.delete('/university/:universityId', authenticated, universityController.deleteUniversityRecord);

// Semester routes
router.put('/semester/:semesterId', authenticated, semesterController.updateSemester);
router.delete('/semester/:semesterId/university/:universityId', authenticated, semesterController.deleteSemester);

module.exports = router;
