import '../styles/Student.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UploadArea from '../components/UploadArea';
// import { FaUpload } from 'react-icons/fa';
import { MdOutlineRemoveRedEye } from "react-icons/md";
// import { db } from '../config/firebase'; 
// import { collection, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import storage from '../config/firebase';
// import DownloadContext from '../providers/DownloadContext';

function Student({ studentId: propStudentId }) {
    const [studentId, setStudentId] = useState(propStudentId);
    const [student, setStudent] = useState([]);
    const [assignments, setAssignments] = useState([]);
    // const [file, setFile] = useState(null);
    // const [uploading, setUploading] = useState(false);
    const [compiling, setCompiling] = useState(false);
    const [compileOutput, setCompileOutput] = useState('');
    // const [isCompiled, setIsCompiled] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [tests, setTests] = useState([]);
    // const [testsBar, setTestsBar] = useState('');
    // const { downloadUrls } = useContext(DownloadContext);

    const navigate = useNavigate();

    useEffect(() => {
      if (!studentId) {
        const storedStudentId = localStorage.getItem('studentId');
        if (storedStudentId) {
          setStudentId(storedStudentId);
        }
      } else {
        localStorage.setItem('studentId', studentId);
      }
    }, [studentId]);

    const handleLogout = (event) => {
      event.preventDefault();
      localStorage.removeItem('studentId');
      setStudentId(null);
      setStudent(null);
      setAssignments([]);
    };
    // const handleFileChange = async (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         setFile(file);
    //         setFileName(file.name); // Update the filename state
    //     } else {
    //         setFileName(''); // Reset the filename if no file is selected
    //     }

    //     setUploading(true);

    //     try {
    //         const storageRef = ref(storage, file.name);
    //         await uploadBytes(storageRef, file);
    //     } catch (error) {
    //         console.error('Error uploading file:', error);
    //     }

    //     setUploading(false);
    // };

    const handleFileCompile = async () => {
        // setCompiling(true);
        // const backendUrl = '/compile';
        // var fileContent = '';
        // try {
        //     const downloadURL = downloadUrls[0];

        //     const response = await fetch(downloadURL);
        //     fileContent = await response.text();
        //     console.log(fileContent);
        //     setFile(null);
        // } catch (error) {
        //     console.error('Error fetching file content:', error);
        // }

        // try {
        //     const response = await axios.post(backendUrl, {
        //         lang: selectedAssignment.codeLanguage.toLowerCase(),
        //         code: fileContent,
        //     });
        //     console.log('Compilation response:', response.data);
        //     setIsCompiled(response.data.compiled)
        //     setCompileOutput(response.data.output); // Adjust based on your actual response structure
        //     setCompiling(false);
        //     console.log(compileOutput);
        // } catch (error) {
        //     console.error('Error sending file content to backend:', error);
        //     setCompileOutput('Error during compilation.');
        //     setCompiling(false);
        // }
    };

    const fetchData = useCallback(async () => {
        // const querySnapshot = await getDocs(collection(db, "exercises"));
        // setExercises(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        try {
          const studentResponse = await axios.get(`/api/student/${studentId}`);
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
    }, [studentId]);

    const handleHomeworkClick = (assignment) => {
        setSelectedAssignment(assignment);
        // setTestsBar('active');
    };

    useEffect(() => {
        // if(!studentId) {
        //     navigate('/api');
        // }
        fetchData();
        const fetchedTests = [
            { id: 1, name: 'Test 1' },
            { id: 2, name: 'Test 2' },
            { id: 3, name: 'Test 3' },
            { id: 3, name: 'Test 3' },
            { id: 3, name: 'Test 3' },
            { id: 3, name: 'Test 3' },
            { id: 3, name: 'Test 3' },
            { id: 3, name: 'Test 3' },
            { id: 3, name: 'Test 3' },
            // Add more test objects as needed
        ];
        setTests(fetchedTests);
    }, [fetchData]);

    return (
        <div className='student-container'>
            <div className='student-header'>
                <h1>Welcome {student.name} </h1>
                <a href='#' onClick={handleLogout}>Logout</a>
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
                        {tests.map((test) => (
                            <li key={test.id}>
                                {test.name}
                                <MdOutlineRemoveRedEye className='test-icon'/>
                                <input type="checkbox" className="test-checkbox" />
                            </li>
                        ))}
                    </ul>
                    </div>
                    <button className='tests-button'>Run</button>
                </div>
                <div className='upload-compile'>
                    <div className='up-header'>
                        <h2>Compile Area</h2>
                    </div>
                    <div className='upload-area'>
                        <UploadArea userId={studentId} assId={0}/>
                    </div>
                    <button onClick={handleFileCompile}> {compiling ? 'Compiling ...' : 'Compile'} </button>
                </div>
            </div>
        </div>
    );
}

export default Student;
