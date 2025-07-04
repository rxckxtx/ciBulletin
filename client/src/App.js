import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ForumList from './components/Forum/ForumList';
import ThreadDetail from './components/Forum/ThreadDetail';
import NewThread from './components/Forum/NewThread';
import Navigation from './components/Navigation/Navigation';
import ResourceHub from './components/ResourceHub/ResourceHub';
import ResourceDetail from './components/ResourceHub/ResourceDetail';
import ResourceForm from './components/ResourceHub/ResourceForm';
import CategoryPage from './components/Forum/CategoryPage';
import { logout, checkAuthStatus } from './services/api';

const Header = ({ isAuthenticated, handleLogout }) => {
  return (
    <header>
      {isAuthenticated ? (
        <Navigation onLogout={handleLogout} />
      ) : (
        <h1 className="app-title">ciBulletin</h1>
      )}
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
    const verifyAuth = async () => {
      try {
        // Try to get user profile - this will succeed if the user is authenticated
        const { isAuthenticated: authStatus } = await checkAuthStatus();
        setIsAuthenticated(authStatus);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  // Function to handle successful login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Call the logout API function
      await logout();

      // Clear user data from localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');

      // Update authentication state
      setIsAuthenticated(false);
    } catch (error) {
      // Still update the state even if there's an error
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      setIsAuthenticated(false);
    }
  };

  return (
    <div className="App">
      <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
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
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route path="/forum" element={isAuthenticated ? <ForumList /> : <Navigate to="/login" />} />
          <Route path="/forum/thread/:id" element={isAuthenticated ? <ThreadDetail /> : <Navigate to="/login" />} />
          <Route path="/forum/new" element={isAuthenticated ? <NewThread /> : <Navigate to="/login" />} />
          <Route path="/forum/category/:categoryId" element={<CategoryPage />} />

          {/* Resource Hub Routes */}
          <Route path="/resources" element={isAuthenticated ? <ResourceHub /> : <Navigate to="/login" />} />
          <Route path="/resources/new" element={isAuthenticated ? <ResourceForm /> : <Navigate to="/login" />} />
          <Route path="/resources/edit/:id" element={isAuthenticated ? <ResourceForm /> : <Navigate to="/login" />} />
          <Route path="/resources/:id" element={isAuthenticated ? <ResourceDetail /> : <Navigate to="/login" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
