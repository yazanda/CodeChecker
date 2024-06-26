import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import AddUser from './pages/addUser';
import TeacherPage from './pages/lecturerPage';
import Login from './pages/login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/api" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/adduser" element={<AddUser />}  />
        <Route path="/lecturer" element={<TeacherPage />}  />
      </Routes>
    </Router>
    // <div className="App">
    //   <Home />
    // </div>
  );
}

export default App;
