import React, { useState } from 'react';
import '../styles/assCard.css';

function AssCard({ exercise, onSave, onDelete, onDefineTests }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...exercise });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="card">
      {isEditing ? (
        <>
          <input className="form-input" type="text" name="courseName" value={formData.courseName} onChange={handleChange} placeholder="Course Name" required />
          <input className="form-input" type="text" name="assignmentName" value={formData.assignmentName} onChange={handleChange} placeholder="Assignment Name" required />
          <select className="form-select" name="codeLanguage" value={formData.codeLanguage} onChange={handleChange} required>
            <option value="" disabled>Select Language</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="nodejs">NodeJS</option>
          </select>
          <input className="form-input" type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
          <input className="form-input" type="text" name="studentIds" value={formData.studentIds} onChange={handleChange} placeholder="Student IDs (comma-separated)" required />
          <button className="button save-button" onClick={handleSave}>Save</button>
          <button className="button cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
        <div className='card-info'>
          <h3 className="card-title">{exercise.courseName}: {exercise.assignmentName}</h3>
          <p className="card-language">Language: {exercise.codeLanguage}</p>
          {/* <p className="card-student-ids">Students: {exercise.studentIds.join(', ')}</p> */}
        </div>
          <div className="card-actions">
            <button className="button edit-button" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="button delete-button" onClick={() => onDelete(exercise.id)}>Delete</button>
            <button className="button define-tests-button" onClick={() => onDefineTests(exercise)}>Define Tests</button>
          </div>
        </>
      )}
    </div>
  );
}

export default AssCard;