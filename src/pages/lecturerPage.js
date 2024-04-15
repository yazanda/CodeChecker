import '../styles/lecturerPage.css'
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase'; // Ensure this points to your Firebase config file
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

function TeacherPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [studentIds, setStudentIds] = useState('');
  const [homeworks, setHomeworks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const handleAddHomework = async (e) => {
    e.preventDefault();

    const studentIdArray = studentIds.split(',').map(id => id.trim());
    try {
      await addDoc(collection(db, "homeworks"), {
        title,
        description,
        dueDate,
        studentIds: studentIdArray,
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setStudentIds('');
      setShowAddForm(false); // Hide the add form after submission
      fetchHomeworks(); // Refresh the list of homework
    } catch (error) {
      console.error("Error adding homework: ", error);
    }
  };

  const fetchHomeworks = async () => {
    const querySnapshot = await getDocs(collection(db, "homeworks"));
    setHomeworks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteHomework = async (id) => {
    await deleteDoc(doc(db, "homeworks", id));
    fetchHomeworks(); // Refresh the list after deletion
  };

  const handleEditHomework = (homework) => {
    // Show the edit form when clicking on a specific assignment
    setSelectedHomework(homework);
  };

  const handleDefineTests = (homework) => {
    // Implement functionality to define tests for the selected homework
    // You can display a modal or redirect to another page for this purpose
    console.log("Define tests for homework:", homework);
  };

  return (
    <div className="teacher-container">
      <div className="homework-list">
        {homeworks.map((homework) => (
          <div key={homework.id} className="homework-item" onClick={() => handleEditHomework(homework)}>
            <span className="homework-title">{homework.title}</span>
            <div className="homework-actions">
              <button className="button delete-button" onClick={() => handleDeleteHomework(homework.id)}>Delete</button>
              <button className="button define-tests-button" onClick={() => handleDefineTests(homework)}>Define Tests</button>
            </div>
          </div>
        ))}
        <div className="homework-item">
          {showAddForm ? (
            <form onSubmit={handleAddHomework} className="add-homework-form">
              <input className="form-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
              <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
              <input className="form-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              <input className="form-input" type="text" value={studentIds} onChange={(e) => setStudentIds(e.target.value)} placeholder="Student IDs (comma-separated)" required />
              <button type="submit" className="button">Add Homework</button>
            </form>
          ) : (
            <button className="button add-button" onClick={() => setShowAddForm(true)}>Add</button>
          )}
        </div>
      </div>
      {selectedHomework && (
        <div className="edit-homework-popup">
          {/* Popup for editing, deleting, and defining tests for the selected homework */}
          <h3>Edit Homework: {selectedHomework.title}</h3>
          {/* Include input fields and buttons for editing, deleting, and defining tests */}
        </div>
      )}
    </div>
  );
}

export default TeacherPage;
