const { admin, db } = require('../utils/firebase');


const getNextAssignmentId = async () => {
    try {
        const assignmentsRef = db.collection('assignments');
        const snapshot = await assignmentsRef.orderBy('id', 'desc').limit(1).get();

        if (snapshot.empty) {
            return 0;
        } else {
            const lastAssignment = snapshot.docs[0].data();
            return lastAssignment.id + 1;
        }
    } catch (error) {
        console.error('Error getting last assignment ID:', error);
        throw error;
    }
};

// Add a new assignment
const addAssignment = async (req, res) => {
    try {
        const assignment = req.body;
        const newId = await getNextAssignmentId();
        assignment.id = newId;

        // Check if assignment with the same name or ID already exists
        const existingAssignment = await db.collection('assignments')
            .where('name', '==', assignment.name)
            .get();

        if (!existingAssignment.empty) {
            return res.status(400).json({ success: false, error: 'Assignment with this name already exists.' });
        }

        const assignmentRef = db.collection('assignments').doc(newId.toString());
        await assignmentRef.set(assignment);

        return res.status(201).json({ success: true, id: newId });
    } catch (error) {
        console.error('Error adding assignment:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Add students to an assignment
const addStudentsToAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { students } = req.body;
        const assignmentRef = db.collection('assignments').doc(id.toString());
        const doc = await assignmentRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Assignment not found.' });
        }

        const currentStudents = doc.data().students || [];

        // Filter out students that are already in the assignment
        const newStudents = students.filter(studentId => !currentStudents.includes(studentId));

        if (newStudents.length === 0) {
            return res.status(400).json({ success: false, error: 'All students are already added to this assignment.' });
        }

        await assignmentRef.update({
            students: admin.firestore.FieldValue.arrayUnion(...newStudents)
        });

        const studentsRefs = newStudents.map(studentId => db.collection('students').doc(studentId.toString()));

        const updatePromises = studentsRefs.map(async (studentRef) => {
            const studentDoc = await studentRef.get();

            if (!studentDoc.exists) {
                console.error(`Lecturer with ID ${studentRef.id} not found.`);
                return;
            }

            await studentRef.update({
                assignments: admin.firestore.FieldValue.arrayUnion(parseInt(id))
            });
        });

        await Promise.all(updatePromises);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adding students:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Add lecturers to an assignment
const addLecturersToAssignment = async (req, res) => {
    try {
        const { id } = req.params; // This is the assignment ID
        const { lecturers } = req.body; // Array of lecturer IDs
        const assignmentRef = db.collection('assignments').doc(id.toString());
        const assignmentDoc = await assignmentRef.get();

        if (!assignmentDoc.exists) {
            return res.status(404).json({ success: false, error: 'Assignment not found.' });
        }

        const currentLecturers = assignmentDoc.data().lects || [];

        // Filter out lecturers that are already in the assignment
        const newLecturers = lecturers.filter(lecturerId => !currentLecturers.includes(lecturerId));

        if (newLecturers.length === 0) {
            return res.status(400).json({ success: false, error: 'All lecturers are already added to this assignment.' });
        }

        // Step 1: Update the assignment document with new lecturers
        await assignmentRef.update({
            lects: admin.firestore.FieldValue.arrayUnion(...newLecturers)
        });

        // Step 2: Add the assignment ID to each lecturer's 'assignments' array
        const lecturerRefs = newLecturers.map(lecturerId => db.collection('lecturers').doc(lecturerId.toString()));

        const updatePromises = lecturerRefs.map(async (lecturerRef) => {
            const lecturerDoc = await lecturerRef.get();

            if (!lecturerDoc.exists) {
                console.error(`Lecturer with ID ${lecturerRef.id} not found.`);
                return;
            }

            await lecturerRef.update({
                assignments: admin.firestore.FieldValue.arrayUnion(parseInt(id))
            });
        });

        await Promise.all(updatePromises);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adding lecturers:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Add a test to an assignment
const addTestToAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { test } = req.body;
        const assignmentRef = db.collection('assignments').doc(id.toString());
        const doc = await assignmentRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Assignment not found.' });
        }

        const currentTests = doc.data().tests || [];

        // Check if a test with the same name already exists
        const duplicateTest = currentTests.find(existingTest => existingTest.name === test.name);

        if (duplicateTest) {
            return res.status(400).json({ success: false, error: 'Test with this name already exists.' });
        }

        await assignmentRef.update({
            tests: admin.firestore.FieldValue.arrayUnion(test)
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adding test:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

const updateAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const {
    name,
    lang,
    commands,
    course,
    os,
    subFilesNames,
  } = req.body;

  try {
    const assignmentRef = db.collection('assignments').doc(assignmentId);

    const updatedFields = {
      name,
      lang,
      commands,
      course,
      os,
      subFilesNames,
    };

    await assignmentRef.update(updatedFields);

    res.status(200).json({ message: 'Assignment fields updated successfully!' });
  } catch (error) {
    console.error('Error updating assignment fields:', error);
    res.status(500).json({ message: 'Failed to update assignment fields.' });
  }
}

const updateTest = async (req, res) => {
    const { assignmentId, testIndex, updatedTest } = req.body;

    try {
        // Fetch the assignment document
        const assignmentRef = db.collection('assignments').doc(assignmentId.toString());
        const assignmentDoc = await assignmentRef.get();

        if (!assignmentDoc.exists) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const assignmentData = assignmentDoc.data();

        // Update the specific test
        const updatedTests = [...assignmentData.tests];
        updatedTests[testIndex] = updatedTest;

        // Update the document in Firestore
        await assignmentRef.update({
            tests: updatedTests
        });

        res.status(200).json({ message: 'Test updated successfully' });
    } catch (error) {
        console.error('Error updating test:', error);
        res.status(500).json({ message: 'Failed to update test', error: error.message });
    }
}

const addSubmition = async (req, res) => {
    const { studentId, assignmentId, results } = req.body;

    try {
        // Convert to the expected data types
        const stid = parseInt(studentId);
        const aid = parseInt(assignmentId);

        // Query the `submits` collection for documents where `aid` and `stid` match
        const submitsRef = db.collection('submits');
        const querySnapshot = await submitsRef
            .where('aid', '==', aid)
            .where('stid', '==', stid)
            .get();

        if (querySnapshot.empty) {
            // Get the last document to determine the next `id`
            const lastIdQuery = await submitsRef.orderBy('id', 'desc').limit(1).get();
            let newId = 0; // Default ID if no documents exist

            if (!lastIdQuery.empty) {
                const lastDoc = lastIdQuery.docs[0].data();
                newId = lastDoc.id + 1; // Increment the last ID by 1
            }

            // Create a new document with the new ID
            await submitsRef.doc(newId.toString()).set({
                id: newId,
                aid: aid,
                stid: stid,
                last: {
                    results: results
                },
                status: false,
                grade: 0 // Example grading logic
            });
        } else {
            // If a document exists, update the existing document
            const submitDocRef = querySnapshot.docs[0].ref;
            await submitDocRef.update({
                last: {
                    status: 'submitted',
                    results: results
                },
                grade: 0 // Example grading logic
            });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving results:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

const calculateGrade = (results, assignmentTests) => {
    return results.reduce((acc, test) => {
        const testIndex = assignmentTests.findIndex(t => t.name === test.name);
        if (testIndex !== -1 && test.status === 'Passed') {
            return acc + parseInt(assignmentTests[testIndex].grade, 10); // Accumulate the specific test's grade
        }
        return acc;
    }, 0);
};

const submit = async (req, res) => {
    const { studentId, assid } = req.body;
    try {
        // Reference to the submissions collection
        const submitsRef = db.collection('submits');
        // Query to find the specific submission
        const stid = parseInt(studentId);
        const aid = parseInt(assid);

        const querySnapshot = await submitsRef
            .where('aid', '==', aid)
            .where('stid', '==', stid)
            .get();

        // Reference to the assignment document
        const assignmentRef = db.collection('assignments').doc(aid.toString());
        const assignmentDoc = await assignmentRef.get();

        if (!assignmentDoc.exists) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (querySnapshot.empty) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Retrieve the submission document reference
        const submitDocRef = querySnapshot.docs[0].ref;
        const submitData = querySnapshot.docs[0].data();

        // Calculate the grade
        const grade = calculateGrade(submitData.last.results, assignmentDoc.data().tests);

        // Update the submission document with status and grade
        await submitDocRef.update({
            status: true,
            grade: grade,
            submittedAt: new Date(), // Optionally add a timestamp
        });

        return res.status(200).json({ message: 'Submission updated successfully', grade: grade });
    } catch (error) {
        console.error('Error updating submission:', error);
        return res.status(500).json({ message: 'Failed to update submission', error: error.message });
    }
}

module.exports = {
    addAssignment,
    addStudentsToAssignment,
    addLecturersToAssignment,
    addTestToAssignment,
    addSubmition,
    updateAssignment,
    updateTest, 
    submit
};