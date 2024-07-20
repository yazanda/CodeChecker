import './App.css';
import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Student from './pages/student';
import AddUser from './pages/addUser';
import Lecturer from './pages/lecturer';
import AssignmentDetail from './components/AssignmentDetails';
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
  const fetchStudents = async () => {
    // Fetch students from the server
    return [{ id: 1, name: 'Student 1' }, { id: 2, name: 'Student 2' }];
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
              <Student studentId={userId}/>
            </DownloadProvider>
          } 
        />
        <Route path="/adduser" element={<AddUser />}  />
        <Route path="/lecturer" element={<Lecturer lecId={userId}/>}  />
        <Route path="/lecturer/:id" element={<AssignmentDetail fetchStudents={fetchStudents} />}>
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
