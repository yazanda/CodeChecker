import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    MDBBtn,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBIcon,
    MDBInput
  }
  from 'mdb-react-ui-kit';
import "../styles/login.css";

const Login = () => {
  const [step, setStep] = useState('login');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleVerifyId = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/verifyId', { idNumber });
      setStep('register');
    } catch (error) {
      setMessage('Verification failed: ' + error.response.data);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/register', { idNumber, email, password });
      setStep('login');
      setMessage('Registration successful. Please login.');
    } catch (error) {
      setMessage('Registration failed: ' + error.response.data);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { idNumber, password });
      setMessage('Login successful.');
      localStorage.setItem('token', response.data.token); // Store the token in localStorage
      navigate('/home'); // Navigate to the Home page
    } catch (error) {
      setMessage('Login failed: ' + error.response.data);
    }
  };

  return (
    <MDBContainer fluid>
      <MDBRow>
      {/* <MDBCol sm='6'> */}
    <div className='logbody'>
      {step === 'login' && (
        <div>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
          <button onClick={() => setStep('verifyId')}>Register</button>
        </div>
      )}
      {step === 'verifyId' && (
        <div>
          <h1>Verify ID</h1>
          <form onSubmit={handleVerifyId}>
            <input
              type="text"
              placeholder="ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
            <button type="submit">Verify ID</button>
          </form>
        </div>
      )}
      {step === 'register' && (
        <div>
          <h1>Register</h1>
          <form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Register</button>
          </form>
        </div>
      )}
      {message && <div className="message">{message}</div>}
    </div>
    {/* <MDBCol/> */}
    </MDBRow>

    </MDBContainer>
  );
};

export default Login;
