import './App.css';
import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Student from './pages/student';
// import AddUser from './pages/addUser';
import Lecturer from './pages/lecturer';
import Assignment from './components/Assignment';
import Welcome from './pages/welcome';
import LoginRegister from './components/LoginRegister';


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
          element={<Student studentId={userId}/>} 
        />
        {/* <Route path="/adduser" element={<AddUser />}  /> */}
        <Route path="/lecturer" element={<Lecturer lecId={userId}/>}  />
        <Route path="/lecturer/:id" element={<Assignment />}>
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
