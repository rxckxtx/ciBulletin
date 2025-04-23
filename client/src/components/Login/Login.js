import React, { useState } from 'react';
import './Login.css';

// Login component using forms, will link tutorials used in documentation
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Just testing for now
  const handleSubmit = (e) => {
    e.preventDefault();
    // We are just logging the form data for now (DO NOT DEPLOY UNTIL THIS IS FIXED IMPORTANT!)
    console.log('Login attempt:', { email, password });
    // TODO: Add actual authentication logic here
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">ciBulletin</h2>
        <p className="login-subtitle">Sign in to your account</p>
        
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
          
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <span className="login-link">Register</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;