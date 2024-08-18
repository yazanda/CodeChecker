import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../comp styles/Assignment.css'
import Modal from './Modal';
import axios from 'axios';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Circles } from 'react-loader-spinner';
import CodeEditor from '@uiw/react-textarea-code-editor';


const Assignment = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submits, setSubmits] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [usedSt, setUsedSt] = useState([]);
  const [addStModalVisible, setAddStModalVisible] = useState(false);
  const [onlyShowSt, setOnlyShowSt] = useState(false);
  const [viewingSubmissions, setViewingSubmissions] = useState(false);
  const [visibleResults, setVisibleResults] = useState({});
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [allLecturers, setAllLecturers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    grade: '',
    expected: '',
    stdin: '',
    main: '',
    valgrind: false,
    hidden: false
  });

  useEffect( () => {
    const fetchData = async () => {
        try {
          const assResponse = await axios.get(`/api/assignment/${id}`);
          const ass = assResponse.data;
          setAssignment(ass);

          const subResponse = await axios.get(`/api/submitions/${id}`);
          const sub = subResponse.data;
          setSubmits(sub.data);
          console.log(sub);
        
          const stPromises = ass.students.map(async (stId) => {
            const stResponse = await axios.get(`/api/student/${stId}`);
            return { id: stId, ...stResponse.data };
          });

          const students = await Promise.all(stPromises);
          setStudents(students);

          const lecPromises = ass.lecturers.map(async (lecId) => {
            const lecResponse = await axios.get(`/api/lecturer/${lecId}`);
            return { id: lecId, ...lecResponse.data };
          });

          const lects = await Promise.all(lecPromises);
          setLecturers(lects);

          if(addStModalVisible){
            const allStResponse = await axios.get(`/api/students`);
            const all = allStResponse.data;
            setAllStudents(all);

            const lecturersRes = await axios.get(`/api/lecturers`);
            setAllLecturers(lecturersRes.data);

          }
  
        } catch (error) {
          console.error('Error fetching assignment or students data:', error);
        }
      };
      fetchData();
  }, [id, addStModalVisible]);


  const handleSaveAssignment = async () => {
    try {
      const response = await axios.put(`/api/assignments/${assignment.id}/update`, {
        name: assignment.name,
        lang: assignment.lang,
        commands: assignment.commands,
        course: assignment.course,
        os: assignment.os,
        subFilesNames: assignment.subFilesNames,
      });
  
      if (response.status === 200) {
        alert('Assignment fields updated successfully!');
      } else {
        alert('Failed to update assignment fields.');
      }
    } catch (error) {
      console.error('Error updating assignment fields:', error);
      alert('An error occurred while updating the assignment fields.');
    }
  };

  
  const handleTestSubmit = async () => {
    try {
      const test = {
          name: newTest.name,
          grade: newTest.grade,
          expected: newTest.expected,
          stdin: newTest.stdin,
          main: newTest.main
      };

      const response = await axios.put(`/api/assignments/${id}/tests`, { test });
      console.log('Test added:', response.data);
      setAssignment((prevAssignment) => ({
          ...prevAssignment,
          tests: [...prevAssignment.tests, test]
      }));
      setNewTest({
        name: '',
        grade: '',
        expected: '',
        stdin: '',
        main: '',
        valgrind: false,
        hidden: false
      }); 
      setIsAddingTest(false);
    } catch (error) {
        console.error('Error saving test:', error);
    }
  };

  const handleSaveStudents = async () => {
    try {
        await axios.put(`/api/assignments/${id}/students`, {
            students: selectedStudents,
        });

        setAddStModalVisible(false);
        // Optionally, refresh the assignment data here
    } catch (error) {
        console.error('Error saving students:', error);
    }
  };

  const handleUpdateTest = async (index, test) => {
    try {
      const response = await axios.put('/api/assignment/updateTest', {
        assignmentId: assignment.id,
        testIndex: index,
        updatedTest: test
    });
  
      if (response.status === 200) {
        alert('Test updated successfully!');
  
        // Optionally, update the assignment state locally after successful update
        const updatedTests = [...assignment.tests];
        updatedTests[index] = test;
        setAssignment({ ...assignment, tests: updatedTests });
      } else {
        alert('Failed to update test.');
      }
    } catch (error) {
      console.error('Error updating test:', error);
      alert('An error occurred while updating the test.');
    }
  };

  const handleDownloadFile = async (sid, aid) => {
    console.log(sid, aid);
    try {
      const response = await axios.get(`/api/download`, {
        params: { sid, aid },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `st${sid}-a${aid}.zip`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
  } catch (error) {
      console.error('Error Downloading Files', error);
  }
  }
  

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents((prevSelected) =>
        prevSelected.includes(studentId)
            ? prevSelected.filter((id) => id !== studentId)
            : [...prevSelected, studentId]
    );
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

  const handleShowStudents = () => {
    setUsedSt(students);
    setAddStModalVisible(true);
    setOnlyShowSt(true);
  }

  const handleAddStudents = () => {
    setUsedSt(allStudents.filter(student => !students.some(st => student.id === st.id)));
    setAddStModalVisible(true);
    setOnlyShowSt(false);
  }

  const handleShowLecturers = () => {
    setUsedSt(lecturers);
    setAddStModalVisible(true);
    setOnlyShowSt(true);
  }

  const handleAddLecturers = () => {
    setUsedSt(allLecturers.filter(lecturer => !lecturers.some(lec => lecturer.id === lec.id)));
    setAddStModalVisible(true);
    setOnlyShowSt(false);
  }
  
  const toggleResultsVisibility = (index) => {
    setVisibleResults((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const findStudentName = (stid) => {
    const student = students.find((student) => student.id === stid);
    return student ? student.name : 'Unknown Student';
  };

  const findStudentId = (stid) => {
    const student = students.find((student) => student.id === stid);
    return student ? student.stid : 'Unknown ID';
  };

  const reformatCodeString = (codeString) => {
    return codeString
      .replace(/\\\\n/g, '\n') // Replace double backslashes and 'n' with actual new line
      .replace(/\\n/g, `\n`)   // Replace remaining single backslash and 'n' with actual new line
      .replace(/\\\\/g, '\\'); // Replace double backslashes with single backslash
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp._seconds * 1000);
    const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    });
    const formattedTime = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${formattedDate} ${formattedTime}`;
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
              <input type="text" value={assignment.course} onChange={(e) => setAssignment({ ...assignment, course: e.target.value })} />
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
            <button onClick={handleSaveAssignment}>Save</button>
            <button onClick={handleShowStudents}>Show Stuents</button>
            <button onClick={handleAddStudents}>Add Students</button>
            <button onClick={handleAddLecturers}>Add Lecturers</button>
            <button onClick={handleShowLecturers}>Show Lecturers</button>
            <button className='delete'>Delete</button>

            <Modal isVisible={addStModalVisible} onClose={() => setAddStModalVisible(false)}>
              <h2>...</h2>
              <div className="student-list">
                {usedSt.map((student) => (
                  <div key={student.id} className="student-item">
                    <div className="student-info">
                      <p className="student-name">{student.name}</p>
                      {student.stid && <p className="student-stid">{student.stid}</p>}
                    </div>
                      {!onlyShowSt && <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleCheckboxChange(student.id)}
                      />}
                      {onlyShowSt && <button className='remove-st'><IoMdCloseCircleOutline /></button>}
                  </div>
                ))}
              </div>
              {!onlyShowSt && <div className="modal-actions">
                <button className='save-st-button'onClick={handleSaveStudents}>Add</button>
              </div>}
            </Modal>
          </div>
        </div> 
      </div>

      <div className="select-view">
      <button disabled={!viewingSubmissions} onClick={() => setViewingSubmissions(false)}>Tests</button>
      <button disabled={viewingSubmissions} onClick={() => setViewingSubmissions(true)}>Submitions</button>
      </div>

      {viewingSubmissions ? (
          <div className="submissions-container">
            <h1>Submissions</h1>
            <table className="submissions-table">
              <thead>
                <tr>
                  <th></th> 
                  <th>ID</th>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Files</th>
                </tr>
              </thead>
              <tbody>
                {submits && submits.length > 0 ? (
                  submits.map((submission, index) => (
                    <React.Fragment key={index}>
                      <tr className="submission-row">
                        <td>
                          <button
                            className="toggle-button"
                            onClick={() => toggleResultsVisibility(index)}
                          >
                            {visibleResults[index] ? <FaChevronDown /> : <FaChevronRight />}
                          </button>
                        </td>
                        <td>{submission.id}</td>
                        <td>{findStudentName(submission.stid)}</td>
                        <td>{findStudentId(submission.stid)}</td>
                        <td>{submission.grade}</td>
                        <td>{submission.status? `Submitted at ${formatTimestamp(submission.submittedAt)}` : `Last Update ${formatTimestamp(submission.submittedAt)}`}</td>
                        <td><button className='down-button' disabled={!submission.status} onClick={() => handleDownloadFile(submission.stid, submission.aid)}>Download Files</button></td>
                      </tr>
                      {visibleResults[index] && (
                        <tr className="results-row">
                          <td colSpan="7">
                            <table className="results-table">
                              <thead>
                                <tr>
                                  <th>Test Name</th>
                                  <th>Result</th>
                                  <th>Output</th>
                                </tr>
                              </thead>
                              <tbody>
                                {submission.last.results && submission.last.results.length > 0 ? (
                                  submission.last.results.map((result, idx) => (
                                    <tr key={idx}>
                                      <td>{result.name}</td>
                                      <td>{result.status}</td>
                                      <td>{result.output}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="3">No results available</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No submissions available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      ) : (
      <div className="tests-details-container">
        <h1>Edit Tests</h1>
        {assignment.tests.map((test, index) => (
          <div className="test-container">
            <div className="top-test-form">
              <div className="top-input">
                <h4>Name</h4>
                <input type="text" value={test.name} 
                  onChange={(e) => {
                    const updatedTests = [...assignment.tests];
                    updatedTests[index].name = e.target.value;
                    setAssignment({ ...assignment, tests: updatedTests });
                  }}  />
              </div>
              <div className="top-input">
                <h4>Grade</h4>
                <input type="text" value={test.grade} 
                  onChange={(e) => {
                    const updatedTests = [...assignment.tests];
                    updatedTests[index].grade = e.target.value;
                    setAssignment({ ...assignment, tests: updatedTests });
                  }}  />
              </div>
              <div className="top-input">
                <h4>Expected Output</h4>
                <input type="text" value={test.expected} 
                  onChange={(e) => {
                    const updatedTests = [...assignment.tests];
                    updatedTests[index].expected = e.target.value;
                    setAssignment({ ...assignment, tests: updatedTests });
                  }}  />
              </div>
              <div className="top-input">
                <h4>Input (stdin)</h4>
                <input type="text" value={test.stdin} 
                  onChange={(e) => {
                    const updatedTests = [...assignment.tests];
                    updatedTests[index].stdin = e.target.value;
                    setAssignment({ ...assignment, tests: updatedTests });
                  }}  />
              </div>
            </div>
            <div className="code">
              <h4>Main Script</h4>
              <CodeEditor
                value={reformatCodeString(test.main)}
                language={assignment.lang.toLowerCase()}
                placeholder="Please enter C code."
                height='50px'
                onChange={(evn) => {
                  const updatedTests = [...assignment.tests];
                  updatedTests[index].main = evn.target.value;
                  setAssignment({ ...assignment, tests: updatedTests });
                }}
                style={{
                  backgroundColor: "#f5f5f5",
                  fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                }}
              />
            </div>
            <div className="test-bottom">
              <div className="checkboxes">
                <label>
                <input type="checkbox" checked={test.valgrind} onChange={(e) => {
                  const updatedTests = [...assignment.tests];
                  updatedTests[index].valgrind = e.target.checked;
                  setAssignment({ ...assignment, tests: updatedTests });
                }} />
                  {'   Valgrind'}
                </label> 
                <label>
                <input type="checkbox" checked={test.hidden} onChange={(e) => {
                  const updatedTests = [...assignment.tests];
                  updatedTests[index].hidden = e.target.checked;
                  setAssignment({ ...assignment, tests: updatedTests });
                }} />
                  {'   Hidden'}
                </label> 
              </div>
              <div className="tests-actions">
                <button className='delete'>Delete</button>
                <button onClick={() => handleUpdateTest(index, test)}>Save</button>
              </div>
            </div>
          </div>
        ))}
        {!isAddingTest && (
          <div className="edit-action-buttons">
            <button onClick={() => setIsAddingTest(true)}>Define Test</button>
          </div>
        )}
        {isAddingTest && (
          <div className="test-container">
            <div className="top-test-form">
              <div className="top-input">
                <h4>Name</h4>
                <input
                  type="text"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                />
              </div>
              {/* Other input fields for new test */}
              <div className="top-input">
                <h4>Grade</h4>
                <input
                  type="text"
                  value={newTest.grade}
                  onChange={(e) => setNewTest({ ...newTest, grade: e.target.value })}
                />
              </div>
              <div className="top-input">
                <h4>Expected Output</h4>
                <input
                  type="text"
                  value={newTest.expected}
                  onChange={(e) => setNewTest({ ...newTest, expected: e.target.value })}
                />
              </div>
              <div className="top-input">
                <h4>Input (stdin)</h4>
                <input
                  type="text"
                  value={newTest.stdin}
                  onChange={(e) => setNewTest({ ...newTest, stdin: e.target.value })}
                />
              </div>
            </div>
            <div className="code">
              <h4>Main Script</h4>
              <CodeEditor
                value={newTest.main}
                language={assignment.lang.toLowerCase()}
                placeholder={`Please enter ${assignment.lang} code.`}
                height="50px"
                onChange={(evn) => setNewTest({ ...newTest, main: evn.target.value })}
                style={{
                  backgroundColor: "#f5f5f5",
                  fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                }}
              />
              <label>
                <input type="checkbox" checked={newTest.valgrind} onChange={(e) => setNewTest({ ...newTest, valgrind: e.target.value })}/>
                {'   Valgrind'}
              </label> 
              <label>
                <input type="checkbox" checked={newTest.hidden} onChange={(e) => setNewTest({ ...newTest, hidden: e.target.value })}/>
                {'   Hidden'}
              </label> 
            </div>
            <div className="edit-action-buttons">
              <button className='cancel' onClick={() => setIsAddingTest(false)}>Cancel</button>
              <button onClick={handleTestSubmit}>Save</button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>              
  );
};

export default Assignment;
