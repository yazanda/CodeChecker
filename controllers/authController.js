// controllers/authController.js
const bcrypt = require('bcrypt');
const { db, auth } = require('../utils/firebase');

const login = async (req, res) => {
  const { type, user, idNumber, password } = req.body;
  const col = type === 'student'? 'students' : 'lecturers';
  const dbval = type === 'student'? 'stid' : 'user';
  const val = type === 'student'? idNumber : user;

  try {
    console.log(type);
    console.log(idNumber);
    console.log(dbval);
    console.log(val);
    const userSnapshot = await db.collection(col).where(dbval, '==', val).get();
    if (userSnapshot.empty) {
      return res.status(404).send('User not found');
    }
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    if(userData.status === 0) {
      return res.status(402).send('User exists but never registered');
    }

    const passwordMatch = await bcrypt.compare(password, userData.pass);
    if (!passwordMatch) {
      return res.status(401).send('Invalid password');
    }

    const token = await auth.createCustomToken(userDoc.id);
    res.status(200).json({ token, userId: userDoc.id });
  } catch (error) {
    console.log(error);
    res.status(500).send('Login failed: ' + error.message);
  }
};

module.exports = { login };
