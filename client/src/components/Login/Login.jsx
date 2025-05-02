import React, { useState } from 'react';
import { login } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// Login component using forms, will link tutorials used in documentation
const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (entry) => {
    entry.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await login({ email, password });

      // Return user data with isAuthenticated flag
      // If not, we'll consider it successful if we get a response with user data
      if (userData && (userData.isAuthenticated || userData._id)) {
        // Store user ID and role in localStorage for client-side access control
        if (userData._id) {
          localStorage.setItem('userId', userData._id);
        }
        if (userData.role) {
          localStorage.setItem('userRole', userData.role);
        }
        onLoginSuccess();
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">ciBulletin</h2>
        <p className="login-subtitle">Sign in to your account</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <span className="login-link" onClick={() => navigate('/register')}>Register</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;