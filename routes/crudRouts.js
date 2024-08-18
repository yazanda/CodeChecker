const express = require('express');
const getData = require('../controllers/fetchController');
const addData = require('../controllers/addController');
const router = express.Router();

//
router.get('/students', getData.studentsColl);
router.get('/student/:userId', getData.studentDoc);
router.get('/assignments', getData.assignmentsColl);
router.get('/assignment/:assId', getData.assignmentDoc);
router.get('/lecturers', getData.lecturersColl);
router.get('/lecturer/:userId', getData.lecturerDoc);
router.get('/submitions/:assId', getData.submitionDoc);
router.get('/submition/:stId/:assId', getData.submitionResults);

//
router.post('/assignment', addData.addAssignment);
router.post('/submition', addData.addSubmition);
router.put('/assignments/:id/students', addData.addStudentsToAssignment);
router.put('/assignments/:id/lecturers', addData.addLecturersToAssignment);
router.put('/assignments/:id/tests', addData.addTestToAssignment);
router.put('/assignments/:id/update', addData.updateAssignment);
router.put('/assignment/updateTest', addData.updateTest);
router.put('/submit', addData.submit);

module.exports = router;
