import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Page/Footer';
import Preloader from './components/Preloader';

import TrendingSection from './components/TrendingSection';
import About from './components/Page/About';
import Contact from './components/Page/Contact';
import SinglePost from './components/Page/SinglePost';

import Login from './components/Login';
import AdminDashboard from './components/AdminPannel/AdminDashboard';
import HeroSlider from './components/Page/HeroSlider';

function App() {
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    const token = localStorage.getItem('token');
    if (user && token) setAdminUser(JSON.parse(user));
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem('adminUser', JSON.stringify(user));
    setAdminUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('token');
    setAdminUser(null);
  };

  return (
    <Router>
      <div className="app">
        {/* Hide Navbar/Footer on admin routes */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Navbar adminUser={adminUser} />} />
        </Routes>

        <Routes>
          {/* Public Routes */}
           
          <Route path="/" element={<HeroSlider />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/post/:id" element={<SinglePost />} />

          {/* Admin Routes */}
          <Route 
            path="/admin/login" 
            element={
              adminUser 
                ? <Login onLogin={handleLogin}  /> 
                : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              adminUser 
                ? <AdminDashboard adminUser={adminUser} onLogout={handleLogout} /> 
                : <Navigate to="/admin/login" />
            } 
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Show Footer/Preloader only on public pages */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<><Footer /><Preloader /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
