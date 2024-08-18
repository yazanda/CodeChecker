import '../styles/Student.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UploadArea from '../components/UploadArea';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Circles } from 'react-loader-spinner';
import Popup from 'reactjs-popup';


function Student({ studentId: propStudentId }) {
    const [studentId, setStudentId] = useState(propStudentId) || localStorage.getItem('studentId');
    const [student, setStudent] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [compiling, setCompiling] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [grade, setGrade] = useState(0);
    const [allTestsPassed, setAllTestsPassed] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [results, setResults] = useState([]);

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
            const response = await axios.post('/api/compile', { assignmentId: `${selectedAssignment.id}`, studentId: `${studentId}` });
            const compileResults = response.data;
            setResults(compileResults);
            const allPassed = compileResults.every(result => result.status === 'Passed');
            setAllTestsPassed(allPassed);

            // Save the last run results to the submits collection
            await axios.post('/api/submition', {
                studentId: studentId,
                assignmentId: selectedAssignment.id,
                results: compileResults
            });

            setCompiling(false);
        } catch (error) {
            alert(error.message);
            setCompiling(false);
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

    const handleHomeworkClick = async (assignment) => {
        setSelectedAssignment(assignment);
        setResults([]);
        try {
            const response = await axios.get(`/api/submition/${studentId}/${assignment.id}`);
            if (response.data.success) {
                console.log(response.data);
                setResults(response.data.sub.last.results);
                setSubmitted(response.data.sub.status);
                setGrade(response.data.sub.grade);
                const allPassed = response.data.sub.last.results.every(result => result.status === 'Passed');
                setAllTestsPassed(allPassed);
                console.log(response.data.sub.status);
            }
        } catch (error) {
            console.error('Error fetching last run results:', error);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await axios.put('/api/submit', {
                studentId: studentId,
                assid: selectedAssignment.id
            });
            setGrade(response.data.grade);
            setSubmitted(true);
            setSubmitting(false);
            console.log(response);
        } catch (error) {
            alert('error while submitting!');
            console.log(error);
            setSubmitting(false);
        }
    }

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
                         <li className={selectedAssignment === assignment.id? 'selected':''} key={assignment.id} onClick={() => handleHomeworkClick(assignment)}>
                             {assignment.course}: {assignment.name}
                         </li>
                     ))}
                     </ul>
                </div>
                <div className='tests-bar'>
                    <div>
                    <h2>Tests for {selectedAssignment ? selectedAssignment.name : '...'}</h2>
                    <ul>
                        {selectedAssignment && selectedAssignment.tests.length !== 0 && (
                            selectedAssignment.tests
                                .filter(test => !test.hidden)
                                .map((test) => (
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
                    <button className='tests-button' onClick={handleFileCompile} disabled={!selectedAssignment || submitted || submitting}>Run Tests</button>
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
                                    <span>Name</span>
                                    <span>Output</span>
                                    <span>Expected</span>
                                    <span>Status</span>
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
                                <div className="submit-button-container">
                                    <p>{submitted? `Grade: ${grade}` : ''}</p>
                                    <button className="submit-button" onClick={handleSubmit} disabled={!allTestsPassed || submitting || submitted}>{submitted? 'Submitted!' : submitting? 'submitting...' : 'Submit'}</button>
                                </div>
                            </div>  
                        </div>
                    )}
                </div>
               
            </div>
        </div>
    );
}

export default Student;
