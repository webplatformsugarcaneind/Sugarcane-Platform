import React from 'react';
import './AboutUsPage.css';

const AboutUsPage = () => {
  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Sugarcane Platform</h1>
          <p className="hero-subtitle">
            Revolutionizing the sugarcane industry through technology, transparency, and sustainable practices
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Mission</h2>
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
            <h2>What We Do</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌾</div>
              <h3>Farmer Empowerment</h3>
              <p>
                We provide farmers with tools for crop management, yield tracking, and direct 
                factory connections, ensuring better prices and reduced intermediary costs.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏭</div>
              <h3>Factory Optimization</h3>
              <p>
                Our platform helps sugar factories streamline supply chain management, 
                optimize production planning, and maintain quality control systems.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Hub Management</h3>
              <p>
                Hub Head Managers can coordinate operations between multiple farms and factories, 
                improving efficiency and communication across the supply chain.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚒️</div>
              <h3>Worker Support</h3>
              <p>
                We connect agricultural workers with verified job opportunities, 
                fair wages, and skill development programs for career growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="about-section">
        <div className="container">
          <div className="vision-content">
            <div className="vision-text">
              <h2>Our Vision</h2>
              <p>
                To become the leading digital platform in the agricultural sector, fostering 
                sustainable farming practices, fair trade, and technological innovation that 
                benefits farmers, factories, and communities worldwide.
              </p>
              <div className="vision-points">
                <div className="vision-point">
                  <span className="point-icon">✓</span>
                  <span>Sustainable Agriculture Practices</span>
                </div>
                <div className="vision-point">
                  <span className="point-icon">✓</span>
                  <span>Fair Price Transparency</span>
                </div>
                <div className="vision-point">
                  <span className="point-icon">✓</span>
                  <span>Technology-Driven Solutions</span>
                </div>
                <div className="vision-point">
                  <span className="point-icon">✓</span>
                  <span>Community Empowerment</span>
                </div>
              </div>
            </div>
            <div className="vision-image">
              <div className="image-placeholder">
                <span className="placeholder-icon">🌱</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Core Values</h2>
          </div>
          <div className="values-grid">
            <div className="value-item">
              <h3>Transparency</h3>
              <p>We believe in open communication and fair pricing throughout the supply chain.</p>
            </div>
            <div className="value-item">
              <h3>Sustainability</h3>
              <p>Promoting environmentally responsible farming practices for future generations.</p>
            </div>
            <div className="value-item">
              <h3>Innovation</h3>
              <p>Leveraging cutting-edge technology to solve traditional agricultural challenges.</p>
            </div>
            <div className="value-item">
              <h3>Community</h3>
              <p>Building strong relationships and supporting the growth of farming communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
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
      </section>
    </div>
  );
};

export default AboutUsPage;