import '../styles/lecturer.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { db } from '../config/firebase';
// import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { IoAddCircleSharp } from "react-icons/io5";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";
// import AssignmentsTable from '../components/AssignmentsTab';
// import Card from '../components/assCard';
// import '../styles/popup.css';


function Lecturer({ lecId: propLecId }) {
  const [lecId, setLecId] = useState(propLecId || localStorage.getItem('lecId'));
  const [lecturer, setLecturer] = useState([]);
  const [assignments, setAssignments] = useState([]);
  // const [courseName, setCourseName] = useState('');
  // const [assignmentName, setAssignmentName] = useState('');
  // const [codeLanguage, setCodeLanguage] = useState('');
  // const [dueDate, setDueDate] = useState('');
  // const [studentIds, setStudentIds] = useState('');
  
  // const [showAddForm, setShowAddForm] = useState(false);
  // const [selectedExercise, setSelectedExercise] = useState(null);


  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/lecturer/${id}`);
  };

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem('lecId');
    setLecId(null);
    setLecturer(null);
    setAssignments([]);
    navigate('/api');
  };

  // console.log(lecId);
  const fetchData = useCallback(async (LecId) => {
    try {
      const lecturerResponse = await axios.get(`/api/lecturer/${LecId}`);
      const lecturer = lecturerResponse.data;
      setLecturer(lecturer);

      const assignmentPromises = lecturer.assignments.map(async (assignmentId) => {
        const assignmentResponse = await axios.get(`/api/assignment/${assignmentId}`);
        return { id: assignmentId, ...assignmentResponse.data };
      });

      const assignments = await Promise.all(assignmentPromises);
      setAssignments(assignments);

    } catch (error) {
       console.error('Error fetching lecturer or assignment data:', error);
    }
},[]);


useEffect(() => {
  if (!lecId) {
    const storedLecId = localStorage.getItem('lecId');
    if (storedLecId) {
      setLecId(storedLecId);
    } else {
        navigate('/api');
    }
  } else {
    localStorage.setItem('lecId', lecId);
  }
  fetchData(lecId);
}, [lecId, navigate, fetchData]);

  // const handleAddExercise = async (e) => {
  //   e.preventDefault();

  //   const studentIdArray = studentIds.split(',').map(id => id.trim());
  //   try {
  //     await addDoc(collection(db, "exercises"), {
  //       courseName,
  //       assignmentName,
  //       codeLanguage,
  //       dueDate,
  //       studentIds: studentIdArray,
  //     });
  //     setCourseName('');
  //     setAssignmentName('');
  //     setCodeLanguage('');
  //     setDueDate('');
  //     setStudentIds('');
  //     setShowAddForm(false); // Hide the add form after submission
  //     fetchExercises(); // Refresh the list of exercises
  //   } catch (error) {
  //     console.error("Error adding exercise: ", error);
  //   }
  // };

  // const fetchExercises = async () => {
  //   const querySnapshot = await getDocs(collection(db, "assignments"));
  //   setAssignments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  // };

  // const handleDeleteExercise = async (id) => {
  //   await deleteDoc(doc(db, "exercises", id));
  //   fetchExercises(); // Refresh the list after deletion
  // };

  // const handleSaveExercise = async (updatedExercise) => {
  //   const exerciseDoc = doc(db, "exercises", updatedExercise.id);
  //   await updateDoc(exerciseDoc, updatedExercise);
  //   fetchExercises(); // Refresh the list after saving
  // };

  // const handleDefineTests = (exercise) => {
  //   console.log("Define tests for exercise:", exercise);
  // };

  // const closePopup = () => {
  //   setSelectedExercise(null);
  // };

  return (
    
    <div className="teacher-container">
      <div className="teach-header">
        <h1>Welcome {lecturer.name}</h1>
        <PiChalkboardTeacherFill size={30} className='teach-header-icon'/>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className='card-container'>
        {/* <AssignmentsTable assignmentsIds={assignments}/> */}
        {assignments.map((item) => (
          <div key={item.id} className='card' onClick={() => handleCardClick(item.id)}>
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
      {/* {showAddForm & } */}
    </div>
  );
}

export default Lecturer;
