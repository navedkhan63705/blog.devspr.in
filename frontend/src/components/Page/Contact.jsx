import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    loading: false,
    error: '',
    success: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: '', success: false });

    // Simulate form submission (replace with actual API call)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
      setFormStatus({ loading: false, error: '', success: true });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      setFormStatus({ 
        loading: false, 
        error: 'Something went wrong. Please try again.', 
        success: false 
      });
    }
  };

  return (
    <>
      {/* Page Title */}
      <div className="page-title">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Contact</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/">Home</a></li>
              <li className="current">Contact</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Contact Section */}
      <section id="contact" className="contact section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">

          {/* Google Maps */}
          <div className="mb-4" data-aos="fade-up" data-aos-delay="200">
            <iframe 
              style={{ border: 0, width: '100%', height: '270px' }} 
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d48389.78314118045!2d-74.006138!3d40.710059!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3bda30d%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1676961268712!5m2!1sen!2sus" 
              frameBorder="0" 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="row gy-4">
            {/* Contact Info */}
            <div className="col-lg-4">
              <div className="info-item d-flex" data-aos="fade-up" data-aos-delay="300">
                <i className="bi bi-geo-alt flex-shrink-0"></i>
                <div>
                  <h3>Address</h3>
                  <p>A108 Adam Street, New York, NY 535022</p>
                </div>
              </div>

              <div className="info-item d-flex" data-aos="fade-up" data-aos-delay="400">
                <i className="bi bi-telephone flex-shrink-0"></i>
                <div>
                  <h3>Call Us</h3>
                  <p>+1 5589 55488 55</p>
                </div>
              </div>

              <div className="info-item d-flex" data-aos="fade-up" data-aos-delay="500">
                <i className="bi bi-envelope flex-shrink-0"></i>
                <div>
                  <h3>Email Us</h3>
                  <p>info@example.com</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-8">
              <form onSubmit={handleSubmit} className="php-email-form" data-aos="fade-up" data-aos-delay="200">
                <div className="row gy-4">
                  
                  <div className="col-md-6">
                    <input 
                      type="text" 
                      name="name" 
                      className="form-control" 
                      placeholder="Your Name" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                    />
                  </div>

                  <div className="col-md-6">
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email" 
                      placeholder="Your Email" 
                      value={formData.email}
                      onChange={handleChange}
                      required 
                    />
                  </div>

                  <div className="col-md-12">
                    <input 
                      type="text" 
                      className="form-control" 
                      name="subject" 
                      placeholder="Subject" 
                      value={formData.subject}
                      onChange={handleChange}
                      required 
                    />
                  </div>

                  <div className="col-md-12">
                    <textarea 
                      className="form-control" 
                      name="message" 
                      rows="6" 
                      placeholder="Message" 
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-12 text-center">
                    {formStatus.loading && (
                      <div className="loading">Loading</div>
                    )}
                    
                    {formStatus.error && (
                      <div className="error-message">{formStatus.error}</div>
                    )}
                    
                    {formStatus.success && (
                      <div className="sent-message">Your message has been sent. Thank you!</div>
                    )}

                    <button 
                      type="submit" 
                      disabled={formStatus.loading}
                      style={{ 
                        opacity: formStatus.loading ? 0.6 : 1,
                        cursor: formStatus.loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {formStatus.loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>

                </div>
              </form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
