import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import ChatbotWidget from '../components/Chatbot/ChatbotWidget';
import './HomePage.css';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const navigate = useNavigate();
  const [rolesData, setRolesData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const handleLangChange = (newLang) => {
    i18n.changeLanguage(newLang);
  };

  // Get mock roles data function
  const getMockRolesData = () => {
    return {
      farmer: {
        title: 'Farmer',
        icon: '🌱',
        description: 'Manage your agricultural operations efficiently',
        features: [
          'Harvest Request',
          'Request Tracking',
          'Marketplace'
        ],
        benefits: [
          'Easy access to harvest managers',
          'Reduced manual communication',
          'Better visibility of activities'
        ]
      },
      hhm: {
        title: 'HHM (Harvest Manager)',
        icon: '👥',
        description: 'Coordinate operations between farmers and factories',
        features: [
          'Request Management',
          'Worker Assignment',
          'Coordination'
        ],
        benefits: [
          'Simplified task handling',
          'Better worker allocation',
          'Improved coordination with farmers and factories'
        ]
      },
      labour: {
        title: 'Worker',
        icon: '⚒️',
        description: 'Find work opportunities and manage your career',
        features: [
          'Job Opportunities',
          'Availability',
          'Wage Tracking'
        ],
        benefits: [
          'Easy access to jobs',
          'Clear work information',
          'Basic wage transparency'
        ]
      },
      factories: {
        title: 'Factory',
        icon: '🏭',
        description: 'Optimize your sugar production operations',
        features: [
          'Contract Management',
          'Announcements',
          'Records'
        ],
        benefits: [
          'Organized contract handling',
          'Easy communication with stakeholders',
          'Better record management'
        ]
      }
    };
  };

  useEffect(() => {
    const fetchRolesData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        setRolesData(getMockRolesData());
      } catch (err) {
        setError('Failed to load roles data. Using fallback data.');
        setRolesData(getMockRolesData());
      } finally {
        setIsLoading(false);
      }
    };
    fetchRolesData();
  }, []);

  useEffect(() => {
    const nav = document.getElementById('nav');
    const handleScroll = () => {
      nav?.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    let animationFrameId;
    const wrap = document.getElementById('heroVis');
    if (wrap) {
      wrap.innerHTML = `
        <div class="hv-ring hv-ring-1"></div>
        <div class="hv-ring hv-ring-2"></div>
        <div class="hv-ring hv-ring-3"></div>
        <div class="hv-center">
          <div class="hv-icon">🌿</div>
          <div class="hv-label">CaneSetu</div>
        </div>
      `;

      const orbitItems = [
        { emoji: '🌱', angle: 0, radius: 170 },
        { emoji: '🏭', angle: 90, radius: 170 },
        { emoji: '⚒️', angle: 180, radius: 170 },
        { emoji: '👥', angle: 270, radius: 170 },
        { emoji: '📊', angle: 45, radius: 110 },
        { emoji: '💳', angle: 225, radius: 110 },
      ];

      const cx = 230, cy = 230;
      orbitItems.forEach(({ emoji, angle, radius }) => {
        const rad = (angle * Math.PI) / 180;
        const x = cx + radius * Math.cos(rad) - 20;
        const y = cy + radius * Math.sin(rad) - 20;
        const d = document.createElement('div');
        d.className = 'orbit-dot';
        d.style.cssText = `left:${x}px;top:${y}px;`;
        d.textContent = emoji;
        wrap.appendChild(d);
      });

      let t = 0;
      const animateDots = () => {
        t += 0.003;
        const dots = wrap.querySelectorAll('.orbit-dot');
        orbitItems.forEach(({ angle, radius }, i) => {
          const rad = ((angle * Math.PI) / 180) + t * (i % 2 === 0 ? 1 : -1);
          const r = i < 4 ? 170 : 110;
          const x = cx + r * Math.cos(rad) - 20;
          const y = cy + r * Math.sin(rad) - 20;
          if (dots[i]) {
            dots[i].style.left = x + 'px';
            dots[i].style.top = y + 'px';
          }
        });
        animationFrameId = requestAnimationFrame(animateDots);
      };
      animateDots();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleGuideBoxClick = (roleTitle) => {
    if (!rolesData || typeof rolesData !== 'object') return;
    let matchedRole = null;
    if (roleTitle.toLowerCase() === 'farmer' || roleTitle.toLowerCase().includes('farmer')) {
      matchedRole = rolesData.farmer;
    } else if (roleTitle.toLowerCase() === 'hhm' || roleTitle.toLowerCase().includes('hhm')) {
      matchedRole = rolesData.hhm;
    } else if (roleTitle.toLowerCase() === 'worker' || roleTitle.toLowerCase().includes('labour')) {
      matchedRole = rolesData.labour;
    } else if (roleTitle.toLowerCase() === 'factories' || roleTitle.toLowerCase().includes('factory')) {
      matchedRole = rolesData.factories;
    }

    if (matchedRole) {
      let roleValue = '';
      if (roleTitle.toLowerCase().includes('farmer')) roleValue = 'Farmer';
      else if (roleTitle.toLowerCase().includes('hhm')) roleValue = 'HHM';
      else if (roleTitle.toLowerCase().includes('labour')) roleValue = 'Labour';
      else if (roleTitle.toLowerCase().includes('factor')) roleValue = 'Factory';
      
      setSelectedRole({ ...matchedRole, role: roleValue });
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  const handleGetStarted = (role) => {
    if (typeof role === 'string' && role) {
      navigate(`/signup?role=${role}`);
    } else {
      navigate('/signup');
    }
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  const renderModalContent = () => {
    if (!selectedRole) return null;
    return (
      <div className="role-modal-content" style={{ position: 'relative' }}>
        <button 
          onClick={handleModalClose} 
          style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '24px',  }}
        >×</button>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.9rem', color: 'var(--white)', marginBottom: '30px' }}>
          {selectedRole.title} <em style={{ fontStyle: 'normal', color: 'var(--green)' }}>Benefits</em>
        </h2>
        <div className="role-details">
          {selectedRole.features && selectedRole.features.length > 0 && (
            <div className="features-section-modal">
              <h3>🚀 Key Features</h3>
              <ul className="features-list">
                {selectedRole.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedRole.benefits && selectedRole.benefits.length > 0 && (
            <div className="benefits-section-modal">
              <h3>💡 Benefits</h3>
              <ul className="benefits-list">
                {selectedRole.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={() => handleGetStarted(selectedRole.role)}>
            Get Started as {selectedRole.title}
          </button>
          <button className="btn-secondary" onClick={handleModalClose}>
            Learn More
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="home-page-container">      <nav id="nav">
        <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <div className="nav-brand-dot"></div>
          <span className="nav-brand-name">CaneSetu</span>
        </a>

        <div className="nav-right">
          <div className="nav-lang-switcher" style={{ position: 'relative', marginRight: '12px' }}>
            <div className="lang-trigger" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '8px 14px', borderRadius: '100px', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '14px', color: 'var(--green)' }}>文/A</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : 'मराठी'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div className="lang-dropdown-menu" style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px', zIndex: 100, opacity: 0, pointerEvents: 'none', transform: 'translateY(-10px)', transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              <button onClick={() => handleLangChange('en')} style={{ background: lang === 'en' ? 'rgba(126,200,67,0.1)' : 'transparent', color: lang === 'en' ? 'var(--green)' : 'var(--white)', border: 'none', padding: '8px 12px', textAlign: 'left', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>English {lang === 'en' && '✓'}</button>
              <button onClick={() => handleLangChange('hi')} style={{ background: lang === 'hi' ? 'rgba(126,200,67,0.1)' : 'transparent', color: lang === 'hi' ? 'var(--green)' : 'var(--white)', border: 'none', padding: '8px 12px', textAlign: 'left', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>हिन्दी {lang === 'hi' && '✓'}</button>
              <button onClick={() => handleLangChange('mr')} style={{ background: lang === 'mr' ? 'rgba(126,200,67,0.1)' : 'transparent', color: lang === 'mr' ? 'var(--green)' : 'var(--white)', border: 'none', padding: '8px 12px', textAlign: 'left', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>मराठी {lang === 'mr' && '✓'}</button>
            </div>
          </div>
          <a href="/login" className="btn-ghost" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>{t('nav.logIn')}</a>
          <a href="/signup" className="btn-solid" onClick={(e) => { e.preventDefault(); handleGetStarted(); }}>{t('nav.getStarted')}</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-mesh"></div>
        <div className="hero-grid"></div>

        <div className="hero-left">
          <div className="hero-badge">
            <div className="hero-badge-pip"></div>
            <span>{t('home.badge')}</span>
          </div>

          <h1>
            {t('home.title1')}<br/>
            <span className="line-green">{t('home.title2')}</span><br/>
            <span className="line-outline">{t('home.title3')}</span>
          </h1>

          <p className="hero-desc">
            {t('home.desc')}
          </p>

          <div className="hero-ctas">
            <a href="/signup" className="btn-hero" onClick={(e) => { e.preventDefault(); handleGetStarted(); }}>
              {t('home.startFree')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual" id="heroVis"></div>
        </div>

      </section>

      <section className="roles-sec">
        <div className="container">
          <div className="roles-header reveal">
            <div className="sec-tag">👥 User Roles</div>
            <h2 className="sec-title">Built for every<br/><em>stakeholder</em></h2>
            <p className="sec-sub">Role-based dashboards and features designed for farmers, workers, harvest managers, and factories to manage their activities efficiently.</p>
          </div>

          <div className="roles-grid reveal">
            <a href="#farmer" className="role-card farmer" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Farmer'); }}>
              <div className="rc-num">01</div>
              <div className="rc-icon">🌱</div>
              <div className="rc-title">Farmer</div>
              <p className="rc-desc">Farmers can manage their harvesting activities digitally by sending requests, tracking work progress, and accessing important updates from factories.</p>
              <div className="rc-tags">
                <span className="rc-tag">Requests</span>
                <span className="rc-tag">Tracking</span>
                <span className="rc-tag">Marketplace</span>
              </div>
              <div className="rc-arrow">→</div>
            </a>

            <a href="#hhm" className="role-card hhm" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('HHM'); }}>
              <div className="rc-num">02</div>
              <div className="rc-icon">👥</div>
              <div className="rc-title">HHM</div>
              <p className="rc-desc">Harvest Managers act as the central coordinators between farmers, workers, and factories by managing requests, assigning tasks, and tracking work progress.</p>
              <div className="rc-tags">
                <span className="rc-tag">Management</span>
                <span className="rc-tag">Assignment</span>
                <span className="rc-tag">Coordination</span>
              </div>
              <div className="rc-arrow">→</div>
            </a>

            <a href="#labour" className="role-card labour" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Labour'); }}>
              <div className="rc-num">03</div>
              <div className="rc-icon">⚒️</div>
              <div className="rc-title">Labour</div>
              <p className="rc-desc">Workers can find job opportunities, respond to hiring requests, and maintain records of their work and wages.</p>
              <div className="rc-tags">
                <span className="rc-tag">Jobs</span>
                <span className="rc-tag">Availability</span>
                <span className="rc-tag">Wages</span>
              </div>
              <div className="rc-arrow">→</div>
            </a>

            <a href="#factory" className="role-card factory" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Factory'); }}>
              <div className="rc-num">04</div>
              <div className="rc-icon">🏭</div>
              <div className="rc-title">Factory</div>
              <p className="rc-desc">Factories manage contract approvals, publish announcements, and maintain supply-related information in the system.</p>
              <div className="rc-tags">
                <span className="rc-tag">Contracts</span>
                <span className="rc-tag">Announcements</span>
                <span className="rc-tag">Records</span>
              </div>
              <div className="rc-arrow">→</div>
            </a>
          </div>
        </div>
      </section>

      <section className="how-sec">
        <div className="container">
          <div className="how-inner">
            <div>
              <div className="reveal">
                <div className="sec-tag">How it works</div>
                <h2 className="sec-title">From field to<br/><em>payment</em> in days</h2>
                <p className="sec-sub" style={{marginBottom: '48px'}}>One connected flow that eliminates paperwork, reduces delays, and ensures fair compensation at every step.</p>
              </div>

              <div className="how-steps">
                <div className="how-step reveal">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">01</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>Registration & Login</h4>
                    <p>All users — Farmers, Workers, Harvest Managers (HHM), and Factories — register and log in to the system using role-based access.</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d1">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">02</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>Farmer Request Submission</h4>
                    <p>Farmers submit requests to harvest managers for harvesting activities and can also view past records and factory updates.</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d2">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">03</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>Harvest Manager Coordination</h4>
                    <p>Harvest managers receive farmer requests, accept or reject them, hire workers, assign tasks, and manage the harvesting process.</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d3">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">04</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>Worker Participation</h4>
                    <p>Workers view job opportunities, accept or reject job requests, update availability, and perform assigned tasks while tracking their work and wages.</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d1">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">05</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>Factory Contract & Updates</h4>
                    <p>Factories receive contract requests from harvest managers, approve or reject them, and post announcements related to supply and operations.</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d2">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">06</div>
                  </div>
                  <div className="hs-content">
                    <h4>Record Management & Tracking</h4>
                    <p>The system maintains records of requests, tasks, job history, and basic payment/wage information in a centralized database for all users.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="how-visual reveal">
              <div style={{fontSize: '0.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '14px'}}>Live Dashboard Preview</div>
              <div className="hv-screen">
                <div className="hv-topbar">
                  <div className="hv-dot" style={{background: '#ff6b6b'}}></div>
                  <div className="hv-dot" style={{background: '#ffc94a'}}></div>
                  <div className="hv-dot" style={{background: '#7ec843'}}></div>
                  <div style={{flex: 1, background: 'var(--border)', height: '1px', margin: '0 10px', borderRadius: '4px'}}></div>
                  <div style={{fontSize: '0.68rem', color: 'var(--muted-2)'}}>canesetu.in/dashboard</div>
                </div>

                <div style={{fontSize: '0.72rem', color: 'var(--muted-2)', marginBottom: '12px', letterSpacing: '.06em', textTransform: 'uppercase'}}>
                  Season Summary — Kharif 2025
                </div>

                <div className="hv-metric-row">
                  <div className="hv-metric">
                    <div className="hv-metric-label">Total Cane (MT)</div>
                    <div className="hv-metric-val green">2,84,631</div>
                  </div>
                  <div className="hv-metric">
                    <div className="hv-metric-label">Pending Payment</div>
                    <div className="hv-metric-val amber">₹43.2L</div>
                  </div>
                  <div className="hv-metric">
                    <div className="hv-metric-label">Active Farmers</div>
                    <div className="hv-metric-val">3,812</div>
                  </div>
                  <div className="hv-metric">
                    <div className="hv-metric-label">Gangs Deployed</div>
                    <div className="hv-metric-val green">214</div>
                  </div>
                </div>

                <div style={{fontSize: '0.68rem', color: 'var(--muted-2)', margin: '16px 0 10px', letterSpacing: '.06em', textTransform: 'uppercase'}}>District Contribution</div>
                <div className="hv-bar-row">
                  <div className="hv-bar-item">
                    <span className="hv-bar-name">Nashik</span>
                    <div className="hv-bar-track"><div className="hv-bar-fill" style={{width: '82%'}}></div></div>
                    <span style={{fontSize: '.68rem', color: 'var(--muted)'}}>82%</span>
                  </div>
                  <div className="hv-bar-item">
                    <span className="hv-bar-name">Pune</span>
                    <div className="hv-bar-track"><div className="hv-bar-fill" style={{width: '67%', animationDelay: '.1s'}}></div></div>
                    <span style={{fontSize: '.68rem', color: 'var(--muted)'}}>67%</span>
                  </div>
                  <div className="hv-bar-item">
                    <span className="hv-bar-name">Solapur</span>
                    <div className="hv-bar-track"><div className="hv-bar-fill" style={{width: '54%', animationDelay: '.2s'}}></div></div>
                    <span style={{fontSize: '.68rem', color: 'var(--muted)'}}>54%</span>
                  </div>
                  <div className="hv-bar-item">
                    <span className="hv-bar-name">Kolhapur</span>
                    <div className="hv-bar-track"><div className="hv-bar-fill" style={{width: '41%', animationDelay: '.3s'}}></div></div>
                    <span style={{fontSize: '.68rem', color: 'var(--muted)'}}>41%</span>
                  </div>
                </div>
              </div>

              <div style={{marginTop: '16px', display: 'flex', gap: '8px'}}>
                <div style={{flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '14px'}}>
                  <div style={{fontSize: '.68rem', color: 'var(--muted-2)', marginBottom: '4px'}}>Crushing Rate</div>
                  <div style={{fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)'}}>+14.3% <span style={{fontSize: '.7rem', color: 'var(--muted)'}}>YoY</span></div>
                </div>
                <div style={{flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '14px'}}>
                  <div style={{fontSize: '.68rem', color: 'var(--muted-2)', marginBottom: '4px'}}>Recovery Rate</div>
                  <div style={{fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--amber)'}}>11.2%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-sec">
        <div className="container">
          <div className="reveal" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px'}}>
            <div>
              <div className="sec-tag">🌾 Platform Capabilities</div>
              <h2 className="sec-title">Everything<br/><em>You Need</em></h2>
              <p className="sec-sub" style={{marginTop: '16px'}}>Designed to simplify coordination between farmers, workers, harvest managers, and factories.</p>
            </div>
          </div>

          <div className="features-grid reveal">
            <div className="feat-card">
              <div className="feat-icon">🔔</div>
              <div className="feat-title">Transaction Notifications</div>
              <p className="feat-body">Receive instant alerts and updates for every single transaction across the platform. Stay completely informed at every step without relying on complex IoT setups.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">💳</div>
              <div className="feat-title">Digital Record Management</div>
              <p className="feat-body">Centralized storage of requests, work history, and basic wage details. Ensures transparency and easy access to all operational records.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">📊</div>
              <div className="feat-title">Activity &amp; Record Tracking</div>
              <p className="feat-body">Structured tracking of requests, tasks, and work history across farmers, workers, and managers for better coordination and visibility.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🌦️</div>
              <div className="feat-title">Agri-Weather Intelligence</div>
              <p className="feat-body">Hyperlocal weather data integrated with harvest scheduling to reduce field losses during rain events.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">📱</div>
              <div className="feat-title">Mobile & Multi-Language Support</div>
              <p className="feat-body">Fully optimized for mobile devices so you can manage your operations on the go. Available in Marathi, Hindi, and English.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🔒</div>
              <div className="feat-title">Secure User Authentication</div>
              <p className="feat-body">Reliable role-based access with structured user login system. Ensures safe data handling across all stakeholders.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container" style={{position: 'relative', zIndex: 2}}>
          <div className="reveal">
            <div className="sec-tag" style={{justifyContent: 'center'}}>Join the Platform</div>
            <h2 className="sec-title">Ready to modernise<br/><em>your operations?</em></h2>
            <p className="sec-sub">Register today — available for all users. Simple onboarding with quick access to the platform.</p>
          </div>
          <div className="cta-band-actions reveal reveal-d1">
            <a href="/signup" className="btn-hero" onClick={(e) => { e.preventDefault(); handleGetStarted(); }}>
              Create Free Account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </a>
          </div>
          <p className="reveal reveal-d2" style={{marginTop: '28px', fontSize: '.78rem', color: 'var(--muted-2)'}}>No complex setup required · Simple web-based access for all users</p>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-brand" style={{display: 'inline-flex'}} onClick={(e) => e.preventDefault()}>
              <div className="nav-brand-dot"></div>
              <span className="nav-brand-name">CaneSetu</span>
            </a>
            <p>A unified digital platform connecting farmers, workers, harvest managers, and factories.</p>
          </div>
          <div className="footer-col">
            <h5>Platform</h5>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Farmer'); }}>For Farmers</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('HHM'); }}>For HHM</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Labour'); }}>For Workers</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Factory'); }}>For Factories</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Project</h5>
            <ul>
              <li><a href="#about" style={{}} onClick={(e) => e.preventDefault()}>About Project</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Modules</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Features</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Documentation</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Help</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Contact</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>System Info</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 CaneSetu. All rights reserved.</div>
          <div className="footer-legal">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          </div>
        </div>
      </footer>

      {isModalOpen && (
        <div className="custom-home-modal-backdrop" onClick={handleModalClose}>
          <div className="custom-home-modal-card" onClick={(e) => e.stopPropagation()}>
            {renderModalContent()}
          </div>
        </div>
      )}

      <ChatbotWidget isPublic={true} />
    </div>
  );
};

export default HomePage;
