import '../styles/addUser.css';
import React, { useState } from 'react';
import { db } from '../config/firebase'; // Adjust this import according to your project structure
import { doc, setDoc } from 'firebase/firestore';

function AddUser() {
  const [id, setId] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [message, setMessage] = useState('');

  const handleAddUser = async (event) => {
    event.preventDefault();

    if (id.length !== 9) {
      setMessage('ID must be 9 digits.');
      return;
    }

    try {
      await setDoc(doc(db, "users", id), { role });
      setMessage(`User with ID: ${id} added as a ${role}.`);
      setId(''); // Reset the form
    } catch (error) {
      console.error("Error adding user to Firestore: ", error);
      setMessage('Failed to add user. Please try again.');
    }
  };

  return (
    <div className="add-user-container">
      <h2>Add User</h2>
      <form onSubmit={handleAddUser}>
        <div>
          <label>ID (9 digits):</label>
          <input type="number" value={id} onChange={(e) => setId(e.target.value)} required />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <button type="submit">Add User</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddUser;
