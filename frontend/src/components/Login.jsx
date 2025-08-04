import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import './style/Login.css';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  // Registration form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: ''
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiService.login(loginData);
      
      if (response.success) {
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        if (response.user.role === 'admin') {
          onLogin(response.user);
          setMessage('Welcome back!');
          setMessageType('success');
          navigate('/admin/dashboard');
        } else {
          localStorage.removeItem('adminUser');
          localStorage.removeItem('token');
          setMessage('Admin access required');
          setMessageType('error');
        }
      } else {
        setMessage(response.message || 'Login failed');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Invalid credentials');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (registerData.password !== registerData.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        adminKey: registerData.adminKey
      });

      if (response.success) {
        setMessage('Account created successfully');
        setMessageType('success');
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '', adminKey: '' });
        setTimeout(() => setIsLogin(true), 1500);
      } else {
        setMessage(response.message || 'Registration failed');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Registration failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '', adminKey: '' });
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        
        {/* Header */}
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">
              <i className="bi bi-journal-richtext"></i>
            </div>
            <h1>ZenBlog</h1>
          </div>
          <p className="tagline">
            {isLogin ? 'Welcome back to your dashboard' : 'Create your admin account'}
          </p>
        </div>

        {/* Form Card */}
        <div className="form-card">
          
          {/* Alert */}
          {message && (
            <div className={`alert ${messageType}`}>
              <i className={`bi ${messageType === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
              <span>{message}</span>
              <button onClick={() => setMessage('')}>
                <i className="bi bi-x"></i>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            
            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={isLogin ? loginData.email : registerData.email}
                onChange={isLogin ? handleLoginChange : handleRegisterChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={isLogin ? loginData.password : registerData.password}
                  onChange={isLogin ? handleLoginChange : handleRegisterChange}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Admin Key</label>
                  <input
                    type="password"
                    name="adminKey"
                    value={registerData.adminKey}
                    onChange={handleRegisterChange}
                    placeholder="Enter admin key"
                    required
                  />
                  <small>Contact administrator for admin key</small>
                </div>
              </>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  {isLogin ? 'Signing in...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <i className={`bi ${isLogin ? 'bi-arrow-right' : 'bi-plus'}`}></i>
                </>
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="form-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button type="button" onClick={switchMode} className="link-btn">
                {isLogin ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
 
        </div>

      </div>
    </div>
  );
};

export default Login;