import React from 'react';
import './AboutUsPage.css';

const AboutUsPage = () => {
  return (
    <div className="about-us-page">


      {/* Hero Section (Boxed) */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-card">
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1 style={{ color: "white" }}>About Sugarcane Platform</h1>
              <p className="hero-subtitle">
                Revolutionizing the sugarcane industry through technology, transparency, and sustainable practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section mission-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Purpose</span>
            <h2>Our Mission</h2>
            <div className="header-divider"></div>
            <p>
              To create a comprehensive digital ecosystem that connects farmers, factories, and workers
              in the sugarcane industry, promoting fair trade, sustainable farming, and economic growth
              for all stakeholders.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="about-section alt-bg">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Services</span>
            <h2>What We Do</h2>
            <div className="header-divider"></div>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="card-gradient-strip"></div>
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <path d="M12 2v20M2 7h10M2 12h10M2 17h10" />
                  <path d="M12 2l5 5-5 5m0 0l-5-5 5-5" />
                </svg>
              </div>
              <div className="feature-content">
                <h3>Farmer Empowerment</h3>
                <p>
                  We provide farmers with tools for crop management, yield tracking, and direct
                  factory connections, ensuring better prices and reduced intermediary costs.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="card-gradient-strip"></div>
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <rect x="3" y="8" width="18" height="13" rx="1" />
                  <path d="M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
                  <line x1="7" y1="12" x2="7" y2="12.01" />
                  <line x1="11" y1="12" x2="11" y2="12.01" />
                  <line x1="15" y1="12" x2="15" y2="12.01" />
                  <line x1="7" y1="16" x2="7" y2="16.01" />
                  <line x1="11" y1="16" x2="11" y2="16.01" />
                  <line x1="15" y1="16" x2="15" y2="16.01" />
                </svg>
              </div>
              <div className="feature-content">
                <h3>Factory Optimization</h3>
                <p>
                  Our platform helps sugar factories streamline supply chain management,
                  optimize production planning, and maintain quality control systems.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="card-gradient-strip"></div>
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="feature-content">
                <h3>Hub Management</h3>
                <p>
                  Hub Head Managers can coordinate operations between multiple farms and factories,
                  improving efficiency and communication across the supply chain.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="card-gradient-strip"></div>
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div className="feature-content">
                <h3>Worker Support</h3>
                <p>
                  We connect agricultural workers with verified job opportunities,
                  fair wages, and skill development programs for career growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="about-section vision-section">
        <div className="container">
          <div className="vision-content">
            <div className="vision-text">
              <span className="section-tag">Future Outlook</span>
              <h2>Our Vision</h2>
              <p>
                To become the leading digital platform in the agricultural sector, fostering
                sustainable farming practices, fair trade, and technological innovation that
                benefits farmers, factories, and communities worldwide.
              </p>
              <div className="vision-points">
                <div className="vision-point">
                  <span className="point-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Sustainable Agriculture Practices</span>
                </div>
                <div className="vision-point">
                  <span className="point-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Fair Price Transparency</span>
                </div>
                <div className="vision-point">
                  <span className="point-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Technology-Driven Solutions</span>
                </div>
                <div className="vision-point">
                  <span className="point-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Community Empowerment</span>
                </div>
              </div>
            </div>
            <div className="vision-image">
              <div className="image-placeholder-circle">
                <div className="circle-content">
                  <svg viewBox="0 0 24 24" width="80" height="80" stroke="currentColor" strokeWidth="1.5" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M12 8v4m0 4h.01" />
                  </svg>
                  <span>Trust & Growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section values-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Core Beliefs</span>
            <h2>Our Core Values</h2>
            <div className="header-divider"></div>
          </div>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon-wrapper transparency-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <h3>Transparency</h3>
              <p>We believe in open communication and fair pricing throughout the supply chain.</p>
            </div>
            <div className="value-item">
              <div className="value-icon-wrapper sustainability-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <h3>Sustainability</h3>
              <p>Promoting environmentally responsible farming practices for future generations.</p>
            </div>
            <div className="value-item">
              <div className="value-icon-wrapper innovation-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3>Innovation</h3>
              <p>Leveraging cutting-edge technology to solve traditional agricultural challenges.</p>
            </div>
            <div className="value-item">
              <div className="value-icon-wrapper community-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Community</h3>
              <p>Building strong relationships and supporting the growth of farming communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (Boxed) */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-overlay"></div>
            <div className="cta-content">
              <h2>Join Our Platform</h2>
              <p>
                Ready to be part of the future of agriculture? Connect with us and start
                your journey towards more efficient and profitable farming.
              </p>
              <div className="cta-buttons">
                <a href="/signup" className="cta-button primary">Get Started</a>
                <a href="/factories" className="cta-button secondary">Explore Factories</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;