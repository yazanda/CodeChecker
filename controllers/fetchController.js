const { db } = require('../utils/firebase');

const studentsColl = async (req, res) => {
  try {
    const snapshot = await db.collection('students').get();
    if (snapshot.empty) {
      return res.status(404).send('No assignments found');
    }
    const students = snapshot.docs.map(doc => doc.data());
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Failed to fetch students');
  }
};
  
const studentDoc = async (req, res) => {
  const { userId } = req.params;
  try {
    const doc = await db.collection('students').doc(userId).get();
    if (!doc.exists) {
      return res.status(404).send('Student not found');
    }
    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error fetching student document:', error);
    res.status(500).send('Failed to fetch student document');
  }
};

const assignmentsColl = async (req, res) => {
  try {
    const snapshot = await db.collection('assignments').get();
    if (snapshot.empty) {
      return res.status(404).send('No assignments found');
    }
    const assignments = snapshot.docs.map(doc => doc.data());
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).send('Failed to fetch assignments');
  }
};

const assignmentDoc = async (req, res) => {
  const { assId } = req.params;
  try {
    const doc = await db.collection('assignments').doc(assId).get();
    if (!doc.exists) {
      return res.status(404).send('assignment not found');
    }
    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error fetching assignment document:', error);
    res.status(500).send('Failed to fetch assignment document');
  }
};

const lecturersColl = async (req, res) => {
  try {
    const snapshot = await db.collection('lecturers').get();
    if (snapshot.empty) {
      return res.status(404).send('No lecturers found');
    }
    const lecturers = snapshot.docs.map(doc => doc.data());
    res.status(200).json(lecturers);
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).send('Failed to fetch lecturers');
  }
};

const lecturerDoc = async (req, res) => {
  const { userId } = req.params;
  // console.log(lecId);
  try {
    const doc = await db.collection('lecturers').doc(userId).get();
    if (!doc.exists) {
      return res.status(404).send('Lecturer not found');
    }
    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error fetching lecturer document:', error);
    res.status(500).send('Failed to fetch lecturer document');
  }
};

const submitionDoc = async (req, res) => {
  const { assId } = req.params;
  try {
    const submitsRef = db.collection('submits');
    const querySnapshot = await submitsRef.where('aid', '==', parseInt(assId)).get();

    if (querySnapshot.empty) {
        return res.status(404).json({ success: false, error: 'No submissions found for this assignment.' });
    }

    const submits = [];
    querySnapshot.forEach(doc => {
        submits.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, data: submits });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const submitionResults = async (req, res) => {
  try {
    const { stId, assId } = req.params;
    
    // Convert to the expected data types
    const sid = parseInt(stId);
    const aid = parseInt(assId);

    // Query the `submits` collection for documents where `aid` and `stid` match
    const submitsRef = db.collection('submits');
    const querySnapshot = await submitsRef
        .where('aid', '==', aid)
        .where('stid', '==', sid)
        .get();

    if (querySnapshot.empty) {
        return res.status(404).json({ success: false, error: 'No submission found for this student and assignment.' });
    }

    // Assuming there's only one submission per student per assignment
    const submissionDoc = querySnapshot.docs[0].data();

    return res.status(200).json({ success: true, sub: submissionDoc });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

module.exports = { 
  studentsColl, 
  studentDoc, 
  assignmentsColl, 
  assignmentDoc, 
  lecturersColl, 
  lecturerDoc, 
  submitionDoc, 
  submitionResults 
};
