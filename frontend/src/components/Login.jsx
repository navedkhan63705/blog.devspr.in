import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom'; 

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

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
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiService.login(loginData);
      
      if (response.success) {
        // Store user data and token
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        // Check if user is admin
        if (response.user.role === 'admin') {
          onLogin(response.user);
          setMessage('Login successful! Welcome to admin dashboard.');
          setMessageType('success');
             navigate('/admin/dashboard'); // Redirect to admin dashboard
        } else {
          // Clear storage for non-admin users
          localStorage.removeItem('adminUser');
          localStorage.removeItem('token');
          setMessage('Access denied. Admin privileges required.');
          setMessageType('error');
        }
      } else {
        setMessage(response.message || 'Login failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.message || 'Login failed. Please check your credentials.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (!registerData.adminKey.trim()) {
      setMessage('Admin key is required to create an admin account.');
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
        setMessage('Registration successful! You can now login with your credentials.');
        setMessageType('success');
        
        // Clear registration form
        setRegisterData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          adminKey: ''
        });
        
        // Switch to login form after 2 seconds
        setTimeout(() => {
          setIsLogin(true);
          setMessage('Please login with your new account.');
          setMessageType('success');
        }, 2000);
      } else {
        setMessage(response.message || 'Registration failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.message || 'Registration failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setMessageType('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '', adminKey: '' });
  };

  return (
    <div className="login-container">
      <div className="container-fluid vh-100">
        <div className="row h-100">
          {/* Left side - Branding */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary">
            <div className="text-center text-white">
              <div className="mb-4">
                <i className="bi bi-journal-text display-1"></i>
              </div>
              <h2 className="mb-3">ZenBlog Admin</h2>
              <p className="lead mb-0">
                {isLogin ? 'Welcome back! Sign in to manage your blog.' : 'Create your admin account to get started.'}
              </p>
              <div className="mt-4">
                <small className="text-white-50">
                  Secure • Professional • Easy to use
                </small>
              </div>
            </div>
          </div>

          {/* Right side - Login/Register Form */}
          <div className="col-lg-6 d-flex align-items-center justify-content-center">
            <div className="login-form-container w-100" style={{ maxWidth: '400px' }}>
              <div className="text-center mb-4">
                <h3 className="fw-bold text-dark">
                  {isLogin ? 'Admin Login' : 'Admin Registration'}
                </h3>
                <p className="text-muted">
                  {isLogin ? 'Enter your credentials to access the dashboard' : 'Create your admin account with the admin key'}
                </p>
              </div>

              {/* Alert Messages */}
              {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                  <i className={`bi ${messageType === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  {message}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setMessage('')}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {/* Login Form */}
              {isLogin ? (
                <form onSubmit={handleLogin} className="needs-validation" noValidate>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                        placeholder="admin@blog.com"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="needs-validation" noValidate>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="registerEmail" className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="registerEmail"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="registerPassword" className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="registerPassword"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="adminKey" className="form-label fw-semibold">Admin Key</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-key"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="adminKey"
                        name="adminKey"
                        value={registerData.adminKey}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Enter admin key"
                      />
                    </div>
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Contact the administrator for the admin key.
                    </div>
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-success btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Create Admin Account
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Switch between Login and Register */}
              <div className="text-center">
                <hr className="my-4" />
                <p className="text-muted mb-0">
                  {isLogin ? "Don't have an admin account?" : "Already have an account?"}
                </p>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={switchMode}
                  disabled={loading}
                >
                  {isLogin ? 'Register as Admin' : 'Back to Login'}
                </button>
              </div>

              {/* Demo credentials for login (only show on login page) */}
              {isLogin && (
                <div className="mt-4 p-3 bg-light rounded">
                  <small className="text-muted d-block mb-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Demo Admin Credentials:
                  </small>
                  <small className="text-muted d-block">Email: admin@blog.com</small>
                  <small className="text-muted d-block">Password: admin123</small>
                </div>
              )}

              {/* Admin key hint for registration */}
              {!isLogin && (
                <div className="mt-4 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                  <small className="text-warning d-block mb-1">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    <strong>Admin Key Required</strong>
                  </small>
                  <small className="text-muted">
                    You need the correct admin key to create an admin account. 
                    Contact the system administrator to get the admin key.
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;