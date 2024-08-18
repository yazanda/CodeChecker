const bcrypt = require('bcrypt');
const { db, auth } = require('../utils/firebase');

const register = async (req, res) => {
  const { type, user, idNumber, email, password } = req.body;
  const col = type === 'student'? 'students' : 'lecturers';
  const dbval = type === 'student'? 'stid' : 'email';
  const val = type === 'student'? idNumber : email;

  console.log(req.body);
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

    const hashedPassword = await bcrypt.hash(password, 10);

    await auth.createUser({
      uid: `${type}-${userDoc.id}`,
      email: email,
      password: password,
    });

    if(type === 'student'){
      await db.collection('students').doc(userDoc.id).update({
        email: email,
        pass: hashedPassword,
        status: 1,
      });
    }
    else {
      await db.collection('lecturers').doc(userDoc.id).update({
        user: user,
        pass: hashedPassword,
      });
    }
    console.log(userDoc.id);
    res.status(200).send('User registered successfully');
  } catch (error) {
    console.log(error);
    res.status(500).send('Registration failed: ' + error.message);
  }
};

module.exports = { register };
