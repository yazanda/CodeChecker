import React, {useState} from 'react';
import {FaUser, FaLock, FaEnvelope} from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../comp styles/loginRegister.css';

const LoginRegister = ({ loginType, onLoginSuccess }) => {

  const navigate = useNavigate();

  const [action, setAction] = useState('');
  const [id, setId] = useState('');
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('hello');

  const registerLink = () => {
    setAction('register');
  };

  const loginLink = () => {
    setAction('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { type: loginType, user, idNumber: id, password });
      setMessage('Login successful.');
      localStorage.setItem('token', response.data.token); // Store the token in localStorage
    //   navigate('/home'); // Navigate to the Home page
      onLoginSuccess(response.data.userId);
      if(loginType === 'student'){
        navigate('/student');
      }
      else {
        navigate('/lecturer');
      }
    } catch (error) {
      setMessage('Login failed: ' + error.response.data);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/register', { type: loginType, user, idNumber: id, email, password });
      setMessage('Registration successful. Please login.');
      setAction('');
    } catch (error) {
      setMessage('Registration failed: ' + error.response.data);
    }
  };

  return (
    <div className='log-container'>
        <div className={`log-wrapper ${action}`}>
            <div className='form-box login'>
                <form action='' onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <div className="input-box">
                        <input type='text'
                        placeholder={loginType === 'student'? 'ID Number' : 'Username'} 
                        value={loginType === 'student'? id : user}
                        onChange={(e) => loginType === 'student'? setId(e.target.value) : setUser(e.target.value)}
                        required />
                        <FaUser className='log-icon'/>
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <FaLock className='log-icon'/>
                    </div>
    
                    <div className="forgot">
                        <button>Forgot password?</button>
                    </div>
    
                    <button className='submit-button' type='submit'>Login</button>
    
                    <div className="register-link">
                        <p>Don't have an account? <button onClick={registerLink}>Register</button></p>
                    </div>
                </form>
            </div>
    
            <div className='form-box register'>
                <form action='' onSubmit={handleRegister}>
                    <h1>Registration</h1>
                    <div className="input-box">
                        <input type='text'
                            placeholder={loginType === 'student'? 'ID Number' : 'Username'} 
                            value={loginType === 'student'? id : user}
                            onChange={(e) => loginType === 'student'? setId(e.target.value) : setUser(e.target.value)}
                            required />
                        <FaUser className='log-icon'/>
                    </div>
                    <div className="input-box">
                        <input
                            type="email"
                            placeholder="Email (JCE)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <FaEnvelope className='log-icon'/>
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <FaLock className='log-icon'/>
                    </div>
    
                    <div className="forgot">
                        <label><input type="checkbox" /> I agree to the terms & conditions</label>
                    </div>
    
                    <button className='submit-button' type='submit'>Register</button>
    
                    <div className="register-link">
                        <p>Already have an account? <button onClick={loginLink}>Login</button></p>
                    </div>
                </form>
                <div className="message">{message}</div>
            </div>
        </div>
    </div>
  )
}

export default LoginRegister;