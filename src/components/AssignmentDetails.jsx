import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../comp styles/AssignmentsTab.css'
import axios from 'axios';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";


const AssignmentDetail = ({ fetchStudents }) => {
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
  
          const studentsData = await fetchStudents();
          setStudents(studentsData);
        } catch (error) {
          console.error('Error fetching assignment or students data:', error);
        }
      };
      fetchAssignmentAndStudents();
    // fetchStudents().then(data => setStudents(data));
  }, [id, fetchStudents]);

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
    return <div>Loading...</div>;
  }


  return (
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
                    <button onClick={handleAddFileName}><IoAddCircleOutline/>  Add File Name</button>
                </div>
            </div>
            <div className="edit-action-buttons">
                <button>Save</button>
                <button>Show Stuents</button>
                <button>Add Students</button>
                <button>Define Tests</button>
            </div>
        </div>

      {/* <h2>Add Test</h2>
      <form onSubmit={handleTestSubmit}>
        <label>
          Test Name:
          <input type="text" value={testName} onChange={(e) => setTestName(e.target.value)} />
        </label>
        <label>
          Main Function:
          <textarea value={testMainFunction} onChange={(e) => setTestMainFunction(e.target.value)}></textarea>
        </label>
        <button type="submit">Add Test</button>
      </form>

      <h2>Add Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.name} <button onClick={() => handleStudentAdd(student.id)}>Add</button>
          </li>
        ))}
      </ul> */}
    </div>

  );
};

export default AssignmentDetail;
