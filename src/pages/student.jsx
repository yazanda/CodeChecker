import '../styles/Student.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UploadArea from '../components/UploadArea';
// import { FaUpload } from 'react-icons/fa';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Circles } from 'react-loader-spinner';
import Popup from 'reactjs-popup';
// import 'reactjs-popup/dist/index.css';
// import { db } from '../config/firebase'; 
// import { collection, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import storage from '../config/firebase';
// import DownloadContext from '../providers/DownloadContext';

function Student({ studentId: propStudentId }) {
    const [studentId, setStudentId] = useState(propStudentId) || localStorage.getItem('studentId');
    const [student, setStudent] = useState([]);
    const [assignments, setAssignments] = useState([]);
    // const [file, setFile] = useState(null);
    // const [uploading, setUploading] = useState(false);
    const [compiling, setCompiling] = useState(false);
    // const [compileOutput, setCompileOutput] = useState('');
    // const [isCompiled, setIsCompiled] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [results, setResults] = useState([]);
    // const [tests, setTests] = useState([]);
    // const [testsBar, setTestsBar] = useState('');
    // const { downloadUrls } = useContext(DownloadContext);

    const navigate = useNavigate();

    useEffect(() => {
      if (!studentId) {
        const storedStudentId = localStorage.getItem('studentId');
        if (storedStudentId) {
          setStudentId(storedStudentId);
        } else {
            navigate('/api');
        }
      } else {
        localStorage.setItem('studentId', studentId);
      }
      console.log(studentId);
    }, [studentId, setStudentId, navigate]);

    const handleLogout = (event) => {
      event.preventDefault();
      localStorage.removeItem('studentId');
      setStudentId(null);
      setStudent(null);
      setAssignments([]);
      navigate('/api');
    };
    

    const handleFileCompile = async () => {
        setResults([]);
        setCompiling(true);
        try {
            const response = await axios.post('/api/compile', {assignmentId: `${selectedAssignment.id}`, studentId: `${studentId}`});
            setResults(response.data);
            setCompiling(false);
        } catch (error) {
            alert(error.message);
        }
    };

    const fetchData = useCallback(async (stid) => {
        try {
          const studentResponse = await axios.get(`/api/student/${stid}`);
          const student = studentResponse.data;
          setStudent(student);

          const assignmentPromises = student.assignments.map(async (assignmentId) => {
            const assignmentResponse = await axios.get(`/api/assignment/${assignmentId}`);
            return { id: assignmentId, ...assignmentResponse.data };
          });

          const assignments = await Promise.all(assignmentPromises);
          setAssignments(assignments);
          console.log(assignments);

        } catch (error) {
           console.error('Error fetching student or assignment data:', error);
        }
    },[]);

    const handleHomeworkClick = (assignment) => {
        setSelectedAssignment(assignment);
        setResults([]);
        // setTestsBar('active');
    };

    const reformatCodeString = (codeString) => {
        const lines = codeString
          .replace(/\\\\/g, '\\') // Replace double backslashes with single backslash
          .replace(/\\"/g, '"')   // Replace escaped quotes with actual quotes
          .split('\\n');          // Split on '\\n' to handle new lines
    
        return lines.map((line, index) => <p key={index} className="popup-text">{line}</p>);
      };

    useEffect(() => {
        fetchData(studentId);
        // const fetchedTests = selectedAssignment.tests || null;
        // setTests(fetchedTests);
    }, [studentId, fetchData]);

    return (
        <div className='student-container'>
            <div className='student-header'>
                <h1>Welcome {student.name} </h1>
                <button onClick={handleLogout}>Logout</button>
            </div>
            <div className='cr-container'>
                <div className='assi-bar'>
                    <h2>Your Assignments</h2>
                    <ul>
                    {assignments.map((assignment) => (
                         <li key={assignment.id} onClick={() => handleHomeworkClick(assignment)}>
                             {assignment.course}: {assignment.name}
                         </li>
                     ))}
                     </ul>
                     
                </div>
                <div className='tests-bar'>
                    <div>
                    <h2>Tests for {selectedAssignment ? selectedAssignment.name : '...'}</h2>
                    <ul>
                        {selectedAssignment && selectedAssignment.tests.length !== 0 && (selectedAssignment.tests.map((test) => (
                            <li key={test.id}>
                                {test.name}
                                {/* <MdOutlineRemoveRedEye className='test-icon'/> */}
                                <Popup
                                  trigger={<button className="popup-button"><MdOutlineRemoveRedEye className='test-icon' /></button>}
                                  position="right center"
                                  contentStyle={{ padding: '0', border: 'none' }} // Optional inline styles to remove default padding/border
                                >
                                  <div className="popup-content">
                                    <h4>Main Script</h4>
                                    {reformatCodeString(test.main)}
                                    <h4>Input</h4>
                                    <p className="popup-text">{test.stdin}</p>
                                  </div>
                                </Popup>
                            </li>
                        )))}
                    </ul>
                    </div>
                    <button className='tests-button' onClick={handleFileCompile} disabled={selectedAssignment === null}>Run Tests</button>
                </div>
                <div className='upload-compile'>
                    {selectedAssignment && (
                        <div className='upload-compile-in'>
                            <div className='up-header'>
                                <h2>{selectedAssignment? `${selectedAssignment.course}: ${selectedAssignment.name}` : 'Select an assignment'}</h2>
                                <IoMdCloseCircleOutline className='up-header-icon' onClick={() => setSelectedAssignment(null)}/>
                            </div>
                            <div className='upload-area'>
                                <UploadArea userId={studentId} assId={selectedAssignment.id}/>
                            </div>
                            <div className="result-area">
                                <div className="results-header">
                                    <h2>Results</h2>
                                    {compiling && 
                                        <Circles height="20" width="20" color="rgb(10, 10, 101)" ariaLabel="loading" />
                                    }
                                </div>
                                <div className="results-content">
                                    <span>Tests</span>
                                        <div className="right-spans">
                                        <span>Name</span>
                                        <span>Output</span>
                                        <span>Expected</span>
                                        <span>Status</span>
                                    </div>
                                </div>
                                <ul>
                                {results.length !== 0 && results.map((res) => (
                                   <li key={res.name} className={res.error || res.status === 'Failed' ? 'error' : ''}>
                                        <span className="name">{res.name}</span>
                                        <span className="out">{res.output}</span>
                                        <span className="expect">{selectedAssignment.tests.find(t => t.name === res.name).expected}</span>
                                        <span className="status">{res.status}</span>
                                    </li>
                                ))}
                                </ul>
                            </div>  
                        </div>
                    )}
                </div>
               
            </div>
        </div>
    );
}

export default Student;
