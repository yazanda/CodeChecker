import './App.css';
import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Student from './pages/student';
import AddUser from './pages/addUser';
import Lecturer from './pages/lecturer';
// import Login from './pages/login';
import Welcome from './pages/welcome';
import LoginRegister from './components/LoginRegister';
import { DownloadProvider } from './providers/DownloadContext';



function App() {
  const [userId, setUserId] = useState(null);
  const [loginType, setLoginType] = useState(null);

  const handleLoginClick = (type, navigate) => {
    setLoginType(type);
    navigate('/login');
  };

  return (
    <Router>
      <Routes>
        <Route path="/api" element={<Welcome onLoginClick={handleLoginClick} />} />
        <Route 
          path="/login" 
          element={
            <LoginRegister 
              loginType={loginType} 
              onLoginSuccess={(id) => setUserId(id)}
            />
          } 
        />
        <Route 
          path="/student" 
          element={
            <DownloadProvider>
              <Student userId={userId}/>
            </DownloadProvider>
          } 
        />
        <Route path="/adduser" element={<AddUser />}  />
        <Route path="/lecturer" element={<Lecturer userId={userId}/>}  />
      </Routes>
    </Router>
  );
}

export default App;
