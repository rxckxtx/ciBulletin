import React, { useState, useEffect } from 'react';
import { register } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import validator from 'validator';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  // Update password strength when password changes (ty zxcvbn library)
  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength(result.score);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate input in real-time
    const newValidationErrors = { ...validationErrors };

    switch (name) {
      case 'username':
        if (value.length < 3) {
          newValidationErrors.username = 'Username must be at least 3 characters';
        } else if (!validator.isAlphanumeric(value.replace(/[_.-]/g, ''))) {
          newValidationErrors.username = 'Username can only contain letters, numbers, and _.-';
        } else {
          newValidationErrors.username = '';
        }
        break;

      case 'email':
        if (!validator.isEmail(value)) {
          newValidationErrors.email = 'Please enter a valid email address';
        } else {
          newValidationErrors.email = '';
        }
        break;

      case 'password':
        if (value.length < 8) {
          newValidationErrors.password = 'Password must be at least 8 characters';
        } else {
          newValidationErrors.password = '';
        }

        // Also check confirm password match
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newValidationErrors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword) {
          newValidationErrors.confirmPassword = '';
        }
        break;

      case 'confirmPassword':
        if (value !== formData.password) {
          newValidationErrors.confirmPassword = 'Passwords do not match';
        } else {
          newValidationErrors.confirmPassword = '';
        }
        break;

      default:
        break;
    }

    setValidationErrors(newValidationErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive form validation
    const errors = [];

    // Check for validation errors
    Object.values(validationErrors).forEach(error => {
      if (error) errors.push(error);
    });

    // Additional validation checks with more robust validation
    if (!username || typeof username !== 'string' || username.trim() === '') {
      errors.push('Username is required and cannot be empty');
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      errors.push('Email is required and cannot be empty');
    }

    if (!password) {
      errors.push('Password is required');
    }

    if (!confirmPassword) {
      errors.push('Please confirm your password');
    }

    // Check password strength
    if (passwordStrength < 2) {
      errors.push('Please use a stronger password with a mix of letters, numbers, and symbols');
    }

    // If there are validation errors, show them and stop submission
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ensure inputs are properly trimmed and validated
      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim();

      // Final validation check before sending
      if (trimmedUsername === '' || trimmedEmail === '') {
        throw new Error('Username and email cannot be empty');
      }

      // Perform additional validation before creating the user data object
      if (trimmedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      // Create a clean object with only the required fields
      const userData = {
        username: String(trimmedUsername), // Ensure it's a string
        email: String(trimmedEmail),       // Ensure it's a string
        password: String(password)         // Ensure it's a string
      };

      console.log('Registering with data:', {
        username: trimmedUsername, // Log the actual username being sent
        email: trimmedEmail,
        password: '[REDACTED]'
      });

      const response = await register(userData);

      // Store user data in localStorage if available
      if (response && response._id) {
        localStorage.setItem('userId', response._id);
        if (response.role) {
          localStorage.setItem('userRole', response.role);
        }
      }

      // Redirect to dashboard if registration was successful and user is authenticated
      if (response && (response.isAuthenticated || response._id)) {
        // If we got a user ID or isAuthenticated flag, move on to dashboard
        navigate('/dashboard');
      } else {
        // Otherwise redirect to login page with success message
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      }
    } catch (err) {
      console.error('Registration error:', err);

      // Potential error checks
      if (err.message && typeof err.message === 'string') {
        if (err.message.includes('username') && err.message.includes('already taken')) {
          setError('This username is already taken. Please choose a different username.');
        } else if (err.message.includes('email') && err.message.includes('already exists')) {
          setError('This email is already registered. Please use a different email or try logging in.');
        } else {
          setError(err.message);
        }
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again with a different username and email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">ciBulletin</h2>
        <p className="register-subtitle">Create a new account</p>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
            {validationErrors.username && (
              <div className="input-error">{validationErrors.username}</div>
            )}
          </div>

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
            {validationErrors.email && (
              <div className="input-error">{validationErrors.email}</div>
            )}
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
              minLength="8"
            />
            {password && (
              <div className="password-strength">
                <div className="strength-meter">
                  <div
                    className={`strength-meter-fill strength-${passwordStrength}`}
                    style={{ width: `${(passwordStrength + 1) * 20}%` }}
                  ></div>
                </div>
                <div className="strength-text">
                  {passwordStrength === 0 && 'Very Weak'}
                  {passwordStrength === 1 && 'Weak'}
                  {passwordStrength === 2 && 'Fair'}
                  {passwordStrength === 3 && 'Good'}
                  {passwordStrength === 4 && 'Strong'}
                </div>
              </div>
            )}
            {validationErrors.password && (
              <div className="input-error">{validationErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              minLength="8"
            />
            {validationErrors.confirmPassword && (
              <div className="input-error">{validationErrors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <span className="register-link" onClick={() => navigate('/login')}>Sign In</span></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
