import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';
import ForumList from './components/Forum/ForumList';
import ThreadDetail from './components/Forum/ThreadDetail';
import NewThread from './components/Forum/NewThread';
import Navigation from './components/Navigation/Navigation'; 

const Header = () => {
  return (
    <header>
      
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} ciBulletin. All rights reserved.</p>
    </footer>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Function to handle successful login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLogin} />} 
            />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLogin} />} 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route path="/forum" element={<ForumList />} />
            <Route path="/forum/thread/:id" element={<ThreadDetail />} />
            <Route path="/forum/new" element={<NewThread />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;