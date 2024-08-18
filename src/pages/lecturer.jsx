import '../styles/lecturer.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { IoAddCircleSharp } from "react-icons/io5";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";
import { Circles } from 'react-loader-spinner';


function Lecturer({ lecId: propLecId }) {
  const [lecId, setLecId] = useState(propLecId || localStorage.getItem('lecId'));
  const [lecturer, setLecturer] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [addModal, setAddModale] = useState(false);
  const [assignmentDetails, setAssignmentDetails] = useState({
    name: '',
    language: '',
    course: '',
    os: ''
  });
  const [errorMessage, setErrorMessage] = useState('All Good!');
  


  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/lecturer/${id}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssignmentDetails(prevDetails => ({
        ...prevDetails,
        [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const newAssignment = {
        name: assignmentDetails.name,
        course: assignmentDetails.course,
        lang: assignmentDetails.language,
        os: assignmentDetails.os,
        lects: [],
        students: [],
        commands: [""],
        subFilesNames: [""],
        tests: []
      };
      const response = await axios.post('/api/assignment', newAssignment);
      console.log('Assignment added:', response.data);
      const assignmentId = response.data.id;
      await axios.put(`/api/assignments/${assignmentId}/lecturers`, {
        lecturers: [lecId]
      });

    console.log(`Lecturer ${lecId} added to assignment ${assignmentId}`);

      // Close the modal after successful submission
      setAddModale(false);
      fetchData(lecId);
    } catch (error) {
        console.error('Error adding assignment:', error);
        setErrorMessage('Failed to add assignment. Please try again.');
    }
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


  if (!lecturer || !assignments) {
    return (
      <div className="spinner-container">
        <Circles height="80" width="80" color="rgb(10, 10, 101)" ariaLabel="loading" />
      </div>
    );
  }
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
        <div className='add-card' onClick={() => setAddModale(true)}>
          <IoAddCircleSharp size={90} style={{fill : 'rgb(10, 10, 101)'}}/>
            <h4>Add Assignment</h4>
        </div>
      </div>
      <Modal isVisible={addModal} onClose={() => setAddModale(false)}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={assignmentDetails.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Course</label>
            <input
              type="text"
              name="course"
              value={assignmentDetails.course}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Language</label>
            <select
               name="language"
               value={assignmentDetails.language}
               onChange={handleInputChange}
               required
            >
              <option value="" disabled>Select a language</option>
              <option value="C">C</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
            </select>
          </div>
          <div>
            <label>OS</label>
            <select
              name="os"
              value={assignmentDetails.os}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select an OS</option>
              <option value="Windows">Windows</option>
              <option value="Linux">Linux</option>
            </select>
          </div>
          <div className="message">
            <p className="error-message">{errorMessage}</p>
          </div>
          <button type="submit">Add</button>
        </form>
      </Modal>
    </div>
  );
}

export default Lecturer;
