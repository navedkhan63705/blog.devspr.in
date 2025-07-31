import React, { useState } from 'react';

const About = () => {
  // Enhanced team data with more details
  const teamMembers = [
    {
      id: 1,
      name: "Walter White",
      position: "Chief Executive Officer",
      image: "assets/img/team/team-1.jpg",
      description: "Leading ZenBlog with innovative vision and strategic excellence. Expert in digital transformation and content strategy.",
      experience: "15+ years",
      social: {
        twitter: "https://twitter.com/walterwhite",
        facebook: "https://facebook.com/walterwhite",
        instagram: "https://instagram.com/walterwhite",
        linkedin: "https://linkedin.com/in/walterwhite"
      },
      skills: ["Strategy", "Leadership", "Innovation"]
    },
    {
      id: 2,
      name: "Sarah Johnson",
      position: "Product Manager",
      image: "assets/img/team/team-2.jpg",
      description: "Passionate about creating user-centered products that deliver exceptional experiences and drive business growth.",
      experience: "8+ years",
      social: {
        twitter: "https://twitter.com/sarahjohnson",
        facebook: "https://facebook.com/sarahjohnson",
        instagram: "https://instagram.com/sarahjohnson",
        linkedin: "https://linkedin.com/in/sarahjohnson"
      },
      skills: ["Product Strategy", "UX/UI", "Analytics"]
    },
    {
      id: 3,
      name: "William Anderson",
      position: "Chief Technology Officer",
      image: "assets/img/team/team-3.jpg",
      description: "Technology enthusiast building scalable solutions with cutting-edge technologies and best development practices.",
      experience: "12+ years",
      social: {
        twitter: "https://twitter.com/williamanderson",
        facebook: "https://facebook.com/williamanderson",
        instagram: "https://instagram.com/williamanderson",
        linkedin: "https://linkedin.com/in/williamanderson"
      },
      skills: ["Full Stack", "Cloud Architecture", "DevOps"]
    },
    {
      id: 4,
      name: "Amanda Jepson",
      position: "Financial Director",
      image: "assets/img/team/team-4.jpg",
      description: "Ensuring financial excellence and strategic planning to support sustainable growth and operational efficiency.",
      experience: "10+ years",
      social: {
        twitter: "https://twitter.com/amandajepson",
        facebook: "https://facebook.com/amandajepson",
        instagram: "https://instagram.com/amandajepson",
        linkedin: "https://linkedin.com/in/amandajepson"
      },
      skills: ["Financial Planning", "Risk Management", "Compliance"]
    }
  ];

  // Company stats
  const stats = [
    { number: "250+", label: "Blog Posts Published", icon: "bi-journal-text" },
    { number: "50K+", label: "Monthly Readers", icon: "bi-people" },
    { number: "15+", label: "Team Members", icon: "bi-person-badge" },
    { number: "5+", label: "Years Experience", icon: "bi-award" }
  ];

  // Company values
  const values = [
    {
      icon: "bi-lightbulb",
      title: "Innovation",
      description: "We constantly push boundaries to deliver cutting-edge solutions and fresh perspectives."
    },
    {
      icon: "bi-heart",
      title: "Passion",
      description: "Every piece of content we create is driven by genuine passion for storytelling and knowledge sharing."
    },
    {
      icon: "bi-shield-check",
      title: "Quality",
      description: "We maintain the highest standards in everything we do, from content creation to user experience."
    },
    {
      icon: "bi-people",
      title: "Community",
      description: "Building meaningful connections and fostering a vibrant community of readers and contributors."
    }
  ];

  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <>
      {/* Page Title */}
      <div className="page-title">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">About</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/">Home</a></li>
              <li className="current">About</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Enhanced About Section */}
      <section id="about" className="about section">
        <div className="container">
          <div className="row gy-4">
            
            <div className="col-lg-6 content" data-aos="fade-up" data-aos-delay="100">
              <p className="who-we-are">Who We Are</p>
              <h3>Unleashing Potential with Creative Strategy</h3>
              <p className="fst-italic">
                At ZenBlog, we believe in the power of words to inspire, educate, and transform. 
                Our platform serves as a bridge between innovative ideas and curious minds, 
                creating a space where knowledge meets creativity.
              </p>
              <ul>
                <li><i className="bi bi-check-circle"></i> 
                  <span>Delivering high-quality, engaging content across diverse topics and industries.</span>
                </li>
                <li><i className="bi bi-check-circle"></i> 
                  <span>Building a community of passionate writers, readers, and thought leaders.</span>
                </li>
                <li><i className="bi bi-check-circle"></i> 
                  <span>Leveraging cutting-edge technology to enhance user experience and content discovery.</span>
                </li>
              </ul>

              {/* Mission Statement */}
              <div className="mission-box" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '2rem',
                borderRadius: '15px',
                marginTop: '2rem'
              }}>
                <h4 style={{ color: 'white', marginBottom: '1rem' }}>Our Mission</h4>
                <p style={{ marginBottom: 0, lineHeight: '1.6' }}>
                  To democratize knowledge sharing and create a platform where every voice can be heard, 
                  every story can inspire, and every reader can discover something new.
                </p>
              </div>
            </div>

            <div className="col-lg-6 about-images" data-aos="fade-up" data-aos-delay="200">
              <div className="row gy-4">
                <div className="col-lg-6">
                  <img src="assets/img/about-company-1.jpg" className="img-fluid" alt="" 
                       style={{ borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                </div>
                <div className="col-lg-6">
                  <div className="row gy-4">
                    <div className="col-lg-12">
                      <img src="assets/img/about-company-2.jpg" className="img-fluid" alt=""
                           style={{ borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    </div>
                    <div className="col-lg-12">
                      <img src="assets/img/about-company-3.jpg" className="img-fluid" alt=""
                           style={{ borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats section" style={{ background: '#f8f9fa', padding: '4rem 0' }}>
        <div className="container">
          <div className="row gy-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="text-center" style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '15px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <i className={`${stat.icon} display-4 text-primary mb-3`}></i>
                  <h3 className="h2 text-primary mb-2">{stat.number}</h3>
                  <p className="mb-0 text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values section">
        <div className="container">
          <div className="section-title text-center mb-5" data-aos="fade-up">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          
          <div className="row gy-4">
            {values.map((value, index) => (
              <div key={index} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="value-item text-center" style={{
                  padding: '2rem',
                  borderRadius: '15px',
                  background: 'white',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                  height: '100%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div className="value-icon mb-3">
                    <i className={`${value.icon} display-4 text-primary`}></i>
                  </div>
                  <h4 className="mb-3">{value.title}</h4>
                  <p className="text-muted">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Team Section */}
      <section id="team" className="team section" style={{ background: '#f8f9fa' }}>
        <div className="container section-title" data-aos="fade-up">
          <div className="section-title-container d-flex align-items-center justify-content-between">
            <h2>Our Amazing Team</h2>
            <p>Meet the passionate individuals behind ZenBlog</p>
          </div>
        </div>

        <div className="container">
          <div className="row gy-4">
            {teamMembers.map((member, index) => (
              <div key={member.id} className="col-lg-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="team-member-card" style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                >
                  <div className="team-member d-flex align-items-start">
                    <div className="pic me-4">
                      <img src={member.image} className="img-fluid" alt=""
                           style={{ 
                             borderRadius: '50%', 
                             width: '80px', 
                             height: '80px', 
                             objectFit: 'cover',
                             border: '4px solid #e9ecef'
                           }} />
                    </div>
                    <div className="member-info flex-grow-1">
                      <h4 className="mb-1">{member.name}</h4>
                      <span className="text-primary fw-bold mb-2 d-block">{member.position}</span>
                      <p className="text-muted mb-3">{member.description}</p>
                      
                      {/* Experience Badge */}
                      <div className="experience-badge mb-3">
                        <span className="badge bg-primary">{member.experience} Experience</span>
                      </div>

                      {/* Skills */}
                      <div className="skills mb-3">
                        {member.skills.map((skill, skillIndex) => (
                          <span key={skillIndex} className="badge bg-light text-dark me-1 mb-1">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Social Links */}
                      <div className="social">
                        <a href={member.social.twitter} className="me-2">
                          <i className="bi bi-twitter-x"></i>
                        </a>
                        <a href={member.social.facebook} className="me-2">
                          <i className="bi bi-facebook"></i>
                        </a>
                        <a href={member.social.instagram} className="me-2">
                          <i className="bi bi-instagram"></i>
                        </a>
                        <a href={member.social.linkedin}>
                          <i className="bi bi-linkedin"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta section" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '5rem 0'
      }}>
        <div className="container text-center" data-aos="fade-up">
          <h2 className="mb-4" style={{ color: 'white' }}>Ready to Join Our Community?</h2>
          <p className="lead mb-4">
            Start your journey with ZenBlog today and become part of our growing community of writers and readers.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button className="btn btn-light btn-lg px-4 py-2">
              <i className="bi bi-pencil-square me-2"></i>
              Start Writing
            </button>
            <button className="btn btn-outline-light btn-lg px-4 py-2">
              <i className="bi bi-envelope me-2"></i>
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
