import '../styles/lecturerPage.css';
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase'; // Ensure this points to your Firebase config file
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Card from '../components/assCard';
import '../styles/popup.css';

function TeacherPage() {
  const [courseName, setCourseName] = useState('');
  const [assignmentName, setAssignmentName] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [studentIds, setStudentIds] = useState('');
  const [exercises, setExercises] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAddExercise = async (e) => {
    e.preventDefault();

    const studentIdArray = studentIds.split(',').map(id => id.trim());
    try {
      await addDoc(collection(db, "exercises"), {
        courseName,
        assignmentName,
        codeLanguage,
        dueDate,
        studentIds: studentIdArray,
      });
      setCourseName('');
      setAssignmentName('');
      setCodeLanguage('');
      setDueDate('');
      setStudentIds('');
      setShowAddForm(false); // Hide the add form after submission
      fetchExercises(); // Refresh the list of exercises
    } catch (error) {
      console.error("Error adding exercise: ", error);
    }
  };

  const fetchExercises = async () => {
    const querySnapshot = await getDocs(collection(db, "exercises"));
    setExercises(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteExercise = async (id) => {
    await deleteDoc(doc(db, "exercises", id));
    fetchExercises(); // Refresh the list after deletion
  };

  const handleSaveExercise = async (updatedExercise) => {
    const exerciseDoc = doc(db, "exercises", updatedExercise.id);
    await updateDoc(exerciseDoc, updatedExercise);
    fetchExercises(); // Refresh the list after saving
  };

  const handleDefineTests = (exercise) => {
    // Implement functionality to define tests for the selected exercise
    // You can display a modal or redirect to another page for this purpose
    console.log("Define tests for exercise:", exercise);
  };

  const closePopup = () => {
    setSelectedExercise(null);
  };

  return (
    <div className="teacher-container">
      <div className="exercise-list">
        {exercises.map((exercise) => (
          <Card
            key={exercise.id}
            exercise={exercise}
            onSave={handleSaveExercise}
            onDelete={handleDeleteExercise}
            onDefineTests={handleDefineTests}
          />
        ))}
        <div className="add-exercise-card">
          {showAddForm ? (
            <form onSubmit={handleAddExercise} className="add-exercise-form">
              <input className="form-input" type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Course Name" required />
              <input className="form-input" type="text" value={assignmentName} onChange={(e) => setAssignmentName(e.target.value)} placeholder="Assignment Name" required />
              <select className="form-select" value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)} required>
                <option value="" disabled>Select Language</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="nodejs">NodeJS</option>
              </select>
              <input className="form-input" type="text" value={studentIds} onChange={(e) => setStudentIds(e.target.value)} placeholder="Student IDs (comma-separated)" required />
              <button type="submit" className="button">Add Exercise</button>
            </form>
          ) : (
            <button className="button add-button" onClick={() => setShowAddForm(true)}>Add Exercise</button>
          )}
        </div>
      </div>
      {selectedExercise && (
        <div className="popup">
          <div className="popup-content">
            <span className="close-button" onClick={closePopup}>&times;</span>
            <h3>Edit Exercise: {selectedExercise.assignmentName}</h3>
            {/* Include input fields and buttons for editing, deleting, and defining tests */}
            {/* Implement edit form here if needed */}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherPage;
