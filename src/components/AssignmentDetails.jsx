import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../comp styles/AssignmentsTab.css'
import axios from 'axios';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";
import { Circles } from 'react-loader-spinner';
import CodeEditor from '@uiw/react-textarea-code-editor';
// import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
// import '../../node_modules/react-loader-spinner/dist/loader/css/react-spinner-loader.cs'

const AssignmentDetail = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [testName, setTestName] = useState('');
  const [testMainFunction, setTestMainFunction] = useState('');

  useEffect( () => {
    const fetchAssignmentAndStudents = async () => {
        try {
          const assResponse = await axios.get(`/api/assignment/${id}`);
          const ass = assResponse.data;
          setAssignment(ass);
        
          const stPromises = ass.students.map(async (stId) => {
            const stResponse = await axios.get(`/api/student/${stId}`);
            return { id: stId, ...stResponse.data };
          });

          const students = await Promise.all(stPromises);
          setStudents(students);
  
        } catch (error) {
          console.error('Error fetching assignment or students data:', error);
        }
      };
      fetchAssignmentAndStudents();
    // fetchStudents().then(data => setStudents(data));
  }, [id]);

  const handleTestSubmit = (e) => {
    e.preventDefault();
    // Submit test details
  };

  const handleStudentAdd = (studentId) => {
    // Add student to assignment
  };

  const handleAddCommand = () => {
    setAssignment({ ...assignment, commands: [...assignment.commands, ''] });
  };
  
  const handleRemoveCommand = (index) => {
    const newCommands = assignment.commands.filter((_, i) => i !== index);
    setAssignment({ ...assignment, commands: newCommands });
  };
  
  const handleAddFileName = () => {
    setAssignment({ ...assignment, subFilesNames: [...assignment.subFilesNames, ''] });
  };
  
  const handleRemoveFileName = (index) => {
    const newFileNames = assignment.subFilesNames.filter((_, i) => i !== index);
    setAssignment({ ...assignment, subFilesNames: newFileNames });
  };
  

  if (!assignment) {
    return (
      <div className="spinner-container">
        <Circles height="80" width="80" color="rgb(10, 10, 101)" ariaLabel="loading" />
      </div>
    );
  }


  return (
    <div className="assignment-container">
      <div className="assignment-detail-container">
        <h1>Edit Assignment</h1>
        <div className="edit-form">
            <div className="top-edit-form">
                <div className="top-input">
                    <h4>Name</h4>
                    <input type="text" value={assignment.name} onChange={(e) => setAssignment({ ...assignment, name: e.target.value })} />
                </div>
                <div className="top-input">
                    <h4>Course</h4>
                    <input type="text" value={assignment.course} onChange={(e) => setAssignment({ ...assignment, name: e.target.value })} />
                </div>
                <div className="top-input">
                    <h4>Language</h4>
                    <select value={assignment.lang} onChange={(e) => setAssignment({ ...assignment, lang: e.target.value })}>
                        <option value="C">C</option>
                        <option value="C++">C++</option>
                        <option value="Java">Java</option>
                        <option value="python">Python</option>
                    </select>
                </div>
                <div className="top-input">
                    <h4>Operating System</h4>
                    <select value={assignment.os} onChange={(e) => setAssignment({ ...assignment, os: e.target.value })}>
                        <option value="Linux">Linux</option>
                        <option value="Windows">Windows</option>
                    </select>
                </div>
            </div>
            <div className="bottom-edit-form">
                <div className="dynamic-inputs">
                    <h4>Commands</h4>
                    {assignment.commands.map((command, index) => (
                        <div className="dynamic-input" key={index}>
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => {
                                    const newCommands = [...assignment.commands];
                                    newCommands[index] = e.target.value;
                                    setAssignment({ ...assignment, commands: newCommands });
                                }}
                            />
                            <button onClick={() => handleRemoveCommand(index)}><IoMdCloseCircleOutline /></button>
                        </div>
                    ))}
                    <button onClick={handleAddCommand}><IoAddCircleOutline/>  Add Command</button>
                </div>
                <div className="dynamic-inputs">
                    <h4>Submission File Names</h4>
                    {assignment.subFilesNames.map((fileName, index) => (
                        <div className="dynamic-input" key={index}>
                          <input
                            type="text"
                            value={fileName}
                            onChange={(e) => {
                              const newFileNames = [...assignment.subFilesNames];
                              newFileNames[index] = e.target.value;
                              setAssignment({ ...assignment, subFilesNames: newFileNames });
                            }}
                          />
                          <button onClick={() => handleRemoveFileName(index)}><IoMdCloseCircleOutline /></button>
                        </div>
                    ))}
                    <button onClick={handleAddFileName}><IoAddCircleOutline />  Add File Name</button>
                </div>
            </div>
            <div className="edit-action-buttons">
                <button>Save</button>
                <button>Show Stuents</button>
                <button>Add Students</button>
                <button>Define Tests</button>
            </div>
        </div> 
      </div>
      <div className="tests-details-container">
        <h1>Edit Tests</h1>
        {assignment.tests.map((test) => (
          <div className="test-container">
                    <div className="top-test-form">
                      <div className="top-input">
                          <h4>Name</h4>
                          <input type="text" value={test.name} onChange={(e) => setAssignment({ ...assignment, name: e.target.value })} />
                      </div>
                      <div className="top-input">
                          <h4>Grade</h4>
                          <input type="text" value={test.grade} onChange={(e) => setAssignment({ ...assignment, name: e.target.value })} />
                      </div>
                      <div className="top-input">
                          <h4>Expected Output</h4>
                          <input type="text" value={test.expected} onChange={(e) => setAssignment({ ...assignment, name: e.target.value })} />
                      </div>
                      <div className="top-input">
                          <h4>Input (stdin)</h4>
                          <input type="text" value={test.stdin} onChange={(e) => setAssignment({ ...assignment, name: e.target.value })} />
                      </div>
                    </div>
                    <div className="code">
                    <h4>Main Script</h4>
                      <CodeEditor
                        value={test.main}
                        language={assignment.lang.toLowerCase()}
                        placeholder="Please enter C code."
                        height='50px'
                        // onChange={(evn) => setCode(evn.target.value)}
                        // padding={15}
                        style={{
                          backgroundColor: "#f5f5f5",
                          fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                        }}
                      />
                    </div>
                    </div>
          ))}
      </div>
    </div>              
  );
};

export default AssignmentDetail;
