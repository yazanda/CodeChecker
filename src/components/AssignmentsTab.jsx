import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import AssignmentForm from './AssignmentForm';
import AssignmentDetails from './AssignmentDetails';
import '../comp styles/AssignmentsTab.css'

const AssignmentsTable = ({assignmentsIds}) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showForm, setShowForm] = useState(false);

//   console.log(assignmentsIds);
  
  const fetchAssignments = useCallback(async () =>{
    try {
        console.log(assignmentsIds);
        const assignmentPromises = assignmentsIds.map(async (Id) => {
          const assignmentResponse = await axios.get(`/api/assignment/${Id}`);
          return { id: Id, ...assignmentResponse.data };
        });
  
        const tempAssignments = await Promise.all(assignmentPromises);
        setAssignments(tempAssignments);
        // console.log(assignments);       
      } catch (error) {
         console.error('Error fetching assignments data:', error);
      }
  },[assignmentsIds]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const columns = [
    { name: 'Name', selector: row => row.name, sortable: true },
    { name: 'Course', selector: row => row.course, sortable: true },
    { name: 'Language', selector: row => row.lang, sortable: true },
    { name: 'Students', selector: row => row.students.length, sortable: true },
    { name: 'Tests', selector: row => row.tests.length, sortable: true },
  ];

  const handleRowClick = (row) => {
    setSelectedAssignment(row);
  };

  const handleAddAssignment = (newAssignment) => {
    setAssignments([...assignments, newAssignment]);
    setShowForm(false);
  };



  const customStyles = {
    
    table: {
        style: {
          maxHeight: '100%', // Change the max height
        //   width: '70%',  // Change the max width
        },
      },
    header: {
      style: {
        minHeight: '56px',
        backgroundColor: 'rgb(10, 10, 101)',
        color: '#fff',
        // width: '100%',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#e3e3e3',
      },
    },
    headCells: {
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },
    },
    rows: {
      style: {
        minHeight: '72px', // override the row height
        backgroundColor: '#fafafa',
      },
      highlightOnHoverStyle: {
        backgroundColor: '#f4f4f4',
        borderBottomColor: '#CCCCCC',
        borderRadius: '25px',
        outline: '1px solid #CCCCCC',
      },
    },
    cells: {
      style: {
        // paddingLeft: '8x', // override the cell padding for data cells
        paddingRight: '8px',
        fontSize: '16px',
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e3e3e3',
        backgroundColor: '#f7f7f7',
        // width: '70%',
      },
    },
  };

  return (
    <div className='main-container'>
      {selectedAssignment ? (
        <AssignmentDetails 
          assignment={selectedAssignment} 
          goBack={() => setSelectedAssignment(null)} 
        />
      ) : (
        <div className='table-container'>
          <button onClick={() => setShowForm(true)}>Add Assignment</button>
          <DataTable
            title="Assignments"
            columns={columns}
            data={assignments}
            pagination
            highlightOnHover
            pointerOnHover
            onRowClicked={handleRowClick}
            customStyles={customStyles}
          />
          {showForm && <AssignmentForm onAddAssignment={handleAddAssignment} />}
        </div>
      )}
    </div>
  );
};

export default AssignmentsTable;
