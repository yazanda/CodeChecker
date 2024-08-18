import React from 'react';
import '../styles/welcome.css';
import { useNavigate } from 'react-router-dom';
import { PiChalkboardTeacherFill } from "react-icons/pi";
import { FaUniversity } from "react-icons/fa";

const Welcome = ({ onLoginClick }) => {

  const navigate = useNavigate();
  return (
    <div className="welcome-page">
      {/* <h1>Welcome</h1> */}
      <div className="login-options">
        <div className="login-square student" onClick={() => onLoginClick('student', navigate)}>
          Student
          <FaUniversity size={70} className='wel-icon'/>
        </div>
        <div className="login-square teacher" onClick={() => onLoginClick('teacher', navigate)}>
          Teacher
          <PiChalkboardTeacherFill size={70} className='wel-icon'/>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
