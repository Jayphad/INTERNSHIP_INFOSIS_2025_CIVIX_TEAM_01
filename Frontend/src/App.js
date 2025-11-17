import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './pages/login';
import Signup from './pages/signup';
import LandingPage from './pages/landing';
import { useEffect, useState } from 'react';
import RefreshHandler from './RefreshHandler';
import ForgotPassword from './pages/forgotpassword';
import Dashboard from './pages/Dashboard';   
import Petitions from "./pages/sections/PetitionsSection";
import Polls from "./pages/sections/PollsSection";
import AdminDashboard from './admin/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  // ✅ Protected route logic with role handling
  const PrivateRoute = ({ element, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) return <Navigate to="/login" />;

    // if allowedRoles is passed and role not in it → block access
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/" />;
    }

    return element;
  };

  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        {/* Citizen Routes */}
        <Route 
          path="/dashboard" 
          element={<PrivateRoute element={<Dashboard />} allowedRoles={['citizen']} />} 
        />
        <Route path="/dashboard/petitions" element={<Petitions />} />
        <Route path="/dashboard/polls" element={<Polls />} />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={<PrivateRoute element={<AdminDashboard />} allowedRoles={['official']} />} 
        />
      </Routes>
    </div>
  );
}

export default App;
