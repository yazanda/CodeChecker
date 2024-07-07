import '../styles/lecturerPage.css';
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase'; // Ensure this points to your Firebase config file
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { IoAddCircleSharp } from "react-icons/io5";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";
// import Card from '../components/assCard';
// import '../styles/popup.css';

function TeacherPage() {
  const [courseName, setCourseName] = useState('');
  const [assignmentName, setAssignmentName] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [studentIds, setStudentIds] = useState('');
  const [assignments, setAssignments] = useState([]);
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
    const querySnapshot = await getDocs(collection(db, "assignments"));
    setAssignments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      <div className="teach-header">
        <h1>Welcome Tamar</h1>
        <PiChalkboardTeacherFill size={30} className='teach-header-icon'/>
        <a href='#'>Logout</a>
      </div>
      <div className='card-container'>
        {assignments.map((item) => (
          <div key={item.id} className='card'>
            <div className='card-header'>
              {item.name}
            </div>
            <div className='card-body'>
              <div className='card-title'>{item.course}</div>
              <div className='card-content'>{item.lang}</div>
            </div>
            <div className='card-footer'>
              {item.footer}
              <div className='card-icons'>
                <MdOutlineRemoveRedEye size={20}/>
                <RiEditLine size={20}/>
              </div>
            </div>
          </div>
        ))}
        <div className='add-card'>
        <IoAddCircleSharp size={90} style={{fill : 'rgb(10, 10, 101)'}}/>
          <h4>Add Assignment</h4>
        </div>
      </div>
    </div>
  );
}

export default TeacherPage;
