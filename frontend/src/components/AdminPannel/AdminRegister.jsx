import React, { useState } from 'react';
import blogService from '../../services/apiService';

const AdminRegister = ({ onSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    if (!formData.adminKey.trim()) {
      alert('Admin key is required to create an admin account!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminKey: formData.adminKey
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Admin account created successfully! You can now login.');
        onSuccess();
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card admin-shadow border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-primary">Admin Registration</h3>
                  <p className="text-muted">Create your admin account</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control admin-form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control admin-form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control admin-form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter password (min 6 characters)"
                      minLength="6"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control admin-form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="Confirm your password"
                      minLength="6"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="adminKey" className="form-label">
                      Admin Key
                      <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showAdminKey ? "text" : "password"}
                        className="form-control admin-form-control"
                        id="adminKey"
                        name="adminKey"
                        value={formData.adminKey}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter the admin key"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowAdminKey(!showAdminKey)}
                      >
                        <i className={`bi ${showAdminKey ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      You need a valid admin key to create an admin account.
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg btn-admin-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Create Admin Account
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={onBackToLogin}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Login
                    </button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    <i className="bi bi-shield-lock me-1"></i>
                    Admin registration requires a valid admin key for security.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
