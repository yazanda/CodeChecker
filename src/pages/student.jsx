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
        setCompiling(true);
        try {
            const response = await axios.post('/api/compile', {assignmentId: `${selectedAssignment.id}`, studentId: `${studentId}`});
            setResults(response.data);

        } catch (error) {

        }
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
        // setTestsBar('active');
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
                                <MdOutlineRemoveRedEye className='test-icon'/>
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
                                <h2>Compile Area</h2>
                            </div>
                            <div className='upload-area'>
                                <UploadArea userId={studentId} assId={selectedAssignment.id}/>
                            </div>
                            <div className="result-area">
                                <h2>Results</h2>
                                <ul>
                                {results.length !== 0 && results.map((res) => (
                                    <li key={res.name}>
                                        <p>{res.name}</p>
                                        <p>{res.status}</p>
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
