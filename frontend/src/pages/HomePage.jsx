import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatbotWidget from '../components/Chatbot/ChatbotWidget';
import LanguageSelector from '../components/LanguageSelector';
import './HomePage.css';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const rolesData = {
    farmer: {
      title: t('roles.farmer', 'Farmer'),
      icon: 'farmer',
      description: t('roles.farmerDesc', 'Manage your agricultural operations efficiently'),
      features: [
        t('homeRolesGrid.farmerTag1', 'Harvest Request'),
        t('homeRolesGrid.farmerTag2', 'Request Tracking'),
        t('homeRolesGrid.farmerTag3', 'Marketplace')
      ],
      benefits: [
        'Easy access to harvest managers',
        'Reduced manual communication',
        'Better visibility of activities'
      ]
    },
    hhm: {
      title: t('roles.hhm', 'HHM (Harvest Manager)'),
      icon: 'hhm',
      description: t('roles.hhmDesc', 'Coordinate operations between farmers and factories'),
      features: [
        t('homeRolesGrid.hhmTag1', 'Request Management'),
        t('homeRolesGrid.hhmTag2', 'Worker Assignment'),
        t('homeRolesGrid.hhmTag3', 'Coordination')
      ],
      benefits: [
        'Simplified task handling',
        'Better worker allocation',
        'Improved coordination with farmers and factories'
      ]
    },
    labour: {
      title: t('roles.labour', 'Worker'),
      icon: 'labour',
      description: t('roles.labourDesc', 'Find work opportunities and manage your career'),
      features: [
        t('homeRolesGrid.labourTag1', 'Job Opportunities'),
        t('homeRolesGrid.labourTag2', 'Availability'),
        t('homeRolesGrid.labourTag3', 'Wage Tracking')
      ],
      benefits: [
        'Easy access to jobs',
        'Clear work information',
        'Basic wage transparency'
      ]
    },
    factories: {
      title: t('roles.factory', 'Factory'),
      icon: 'factory',
      description: t('roles.factoryDesc', 'Optimize your sugar production operations'),
      features: [
        t('homeRolesGrid.factoryTag1', 'Contract Management'),
        t('homeRolesGrid.factoryTag2', 'Announcements'),
        t('homeRolesGrid.factoryTag3', 'Records')
      ],
      benefits: [
        'Organized contract handling',
        'Easy communication with stakeholders',
        'Better record management'
      ]
    }
  };

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
          <div class="hv-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3C12 3 6.5 8 6.5 13a5.5 5.5 0 0 0 11 0C17.5 8 12 3 12 3Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 13v8M9 18h6" />
            </svg>
          </div>
          <div class="hv-label">CaneSetu</div>
        </div>
      `;

      const orbitSVGs = [
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3C12 3 6.5 8 6.5 13a5.5 5.5 0 0 0 11 0C17.5 8 12 3 12 3Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 13v8M9 18h6"/></svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205v3m-5.25-9h-.008v.008h.008V3.75Z"/></svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z"/></svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/></svg>`,
      ];

      const orbitItems = [
        { svg: orbitSVGs[0], angle: 0, radius: 170 },
        { svg: orbitSVGs[1], angle: 90, radius: 170 },
        { svg: orbitSVGs[2], angle: 180, radius: 170 },
        { svg: orbitSVGs[3], angle: 270, radius: 170 },
        { svg: orbitSVGs[4], angle: 45, radius: 110 },
        { svg: orbitSVGs[5], angle: 225, radius: 110 },
      ];

      const cx = 230, cy = 230;
      orbitItems.forEach(({ svg, angle, radius }) => {
        const rad = (angle * Math.PI) / 180;
        const x = cx + radius * Math.cos(rad) - 20;
        const y = cy + radius * Math.sin(rad) - 20;
        const d = document.createElement('div');
        d.className = 'orbit-dot';
        d.style.cssText = `left:${x}px;top:${y}px;display:flex;align-items:center;justify-content:center;`;
        d.innerHTML = svg;
        wrap.appendChild(d);
      });

      let t = 0;
      const animateDots = () => {
        t += 0.003;
        const dots = wrap.querySelectorAll('.orbit-dot');
        orbitItems.forEach(({ angle }, i) => {
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

  const renderModalContent = () => {
    if (!selectedRole) return null;
    return (
      <div className="role-modal-content" style={{ position: 'relative' }}>
        <button 
          onClick={handleModalClose} 
          style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '24px',  }}
        >×</button>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.9rem', color: 'var(--white)', marginBottom: '30px' }}>
          {selectedRole.title} <em style={{ fontStyle: 'normal', color: 'var(--green)' }}>{t('homeRolesGrid.modalBenefits')}</em>
        </h2>
        <div className="role-details">
          {selectedRole.features && selectedRole.features.length > 0 && (
            <div className="features-section-modal">
              <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" style={{verticalAlign:'middle',marginRight:6}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.198-8.593 15.09 15.09 0 0 1 8.593 2.198c-.02.104-.04.208-.06.311m-5.03-6.169.85-.85m4.95 4.95.85.85M8.91 8.91l-.707.707M15.09 15.09l.707.707"/></svg> {t('homeRolesGrid.modalFeatures')}</h3>
              <ul className="features-list">
                {selectedRole.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedRole.benefits && selectedRole.benefits.length > 0 && (
            <div className="benefits-section-modal">
              <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" style={{verticalAlign:'middle',marginRight:6}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg> {t('homeRolesGrid.modalBenefits')}</h3>
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
            {t('homeRolesGrid.modalGetStarted')} {selectedRole.title}
          </button>
          <button className="btn-secondary" onClick={handleModalClose}>
            {t('homeRolesGrid.modalLearnMore')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="home-page-container">      <nav id="nav">
        <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <div className="nav-brand-dot"></div>
          <span className="nav-brand-name">{t('nav.brand')}</span>
        </a>

        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LanguageSelector />
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{marginRight: 6, color: 'var(--green)'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18C8.5 3 5 6.5 5 11s3.5 8 7 8m0-16c3.5 0 7 3.5 7 8s-3.5 8-7 8" />
            </svg>
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
            <div className="sec-tag" style={{display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              {t('home.tagRoles')}
            </div>
            <h2 className="sec-title">{t('home.titleRoles1')}<br/><em>{t('home.titleRoles2')}</em></h2>
            <p className="sec-sub">{t('home.descRoles')}</p>
          </div>

          <div className="roles-grid reveal">
            <a href="#farmer" className="role-card farmer" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Farmer'); }}>
              <div className="rc-num">01</div>
              <div className="rc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3C12 3 6.5 8 6.5 13a5.5 5.5 0 0 0 11 0C17.5 8 12 3 12 3Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 13v8M9 18h6"/></svg></div>
              <div className="rc-title">Farmer</div>
              <p className="rc-desc">{t('homeRolesGrid.farmerDesc')}</p>
              <div className="rc-tags">
                <span className="rc-tag">{t('homeRolesGrid.farmerTag1')}</span>
                <span className="rc-tag">{t('homeRolesGrid.farmerTag2')}</span>
                <span className="rc-tag">{t('homeRolesGrid.farmerTag3')}</span>
              </div>
              <div className="rc-arrow">→</div>
            </a>

            <a href="#hhm" className="role-card hhm" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('HHM'); }}>
              <div className="rc-num">02</div>
              <div className="rc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <div className="rc-title">HHM</div>
              <p className="rc-desc">{t('homeRolesGrid.hhmDesc')}</p>
              <div className="rc-tags">
                <span className="rc-tag">{t('homeRolesGrid.hhmTag1')}</span>
                <span className="rc-tag">{t('homeRolesGrid.hhmTag2')}</span>
                <span className="rc-tag">{t('homeRolesGrid.hhmTag3')}</span>
              </div>
              <div className="rc-arrow">→</div>
            </a>

            <a href="#labour" className="role-card labour" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Labour'); }}>
              <div className="rc-num">03</div>
              <div className="rc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z"/></svg></div>
              <div className="rc-title">Labour</div>
              <p className="rc-desc">{t('homeRolesGrid.labourDesc')}</p>
              <div className="rc-tags">
                <span className="rc-tag">{t('homeRolesGrid.labourTag1')}</span>
                <span className="rc-tag">{t('homeRolesGrid.labourTag2')}</span>
                <span className="rc-tag">{t('homeRolesGrid.labourTag3')}</span>
              </div>
              <div className="rc-arrow">→</div>
            </a>

            <a href="#factory" className="role-card factory" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Factory'); }}>
              <div className="rc-num">04</div>
              <div className="rc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205v3m-5.25-9h-.008v.008h.008V3.75Z"/></svg></div>
              <div className="rc-title">Factory</div>
              <p className="rc-desc">{t('homeRolesGrid.factoryDesc')}</p>
              <div className="rc-tags">
                <span className="rc-tag">{t('homeRolesGrid.factoryTag1')}</span>
                <span className="rc-tag">{t('homeRolesGrid.factoryTag2')}</span>
                <span className="rc-tag">{t('homeRolesGrid.factoryTag3')}</span>
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
                <div className="sec-tag">{t('homeHow.tag')}</div>
                <h2 className="sec-title">{t('homeHow.title1')}<br/><em>{t('homeHow.title2')}</em> {t('homeHow.title3')}</h2>
                <p className="sec-sub" style={{marginBottom: '48px'}}>{t('homeHow.sub')}</p>
              </div>

              <div className="how-steps">
                <div className="how-step reveal">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">01</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>{t('homeHow.step1Title')}</h4>
                    <p>{t('homeHow.step1Desc')}</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d1">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">02</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>{t('homeHow.step2Title')}</h4>
                    <p>{t('homeHow.step2Desc')}</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d2">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">03</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>{t('homeHow.step3Title')}</h4>
                    <p>{t('homeHow.step3Desc')}</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d3">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">04</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>{t('homeHow.step4Title')}</h4>
                    <p>{t('homeHow.step4Desc')}</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d1">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">05</div>
                    <div className="hs-line"></div>
                  </div>
                  <div className="hs-content">
                    <h4>{t('homeHow.step5Title')}</h4>
                    <p>{t('homeHow.step5Desc')}</p>
                  </div>
                </div>
                <div className="how-step reveal reveal-d2">
                  <div className="hs-dot-wrap">
                    <div className="hs-dot">06</div>
                  </div>
                  <div className="hs-content">
                    <h4>{t('homeHow.step6Title')}</h4>
                    <p>{t('homeHow.step6Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="how-visual reveal">
              <div style={{fontSize: '0.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '14px'}}>{t('homeHow.dashPreview')}</div>
              <div className="hv-screen">
                <div className="hv-topbar">
                  <div className="hv-dot" style={{background: '#ff6b6b'}}></div>
                  <div className="hv-dot" style={{background: '#ffc94a'}}></div>
                  <div className="hv-dot" style={{background: '#7ec843'}}></div>
                  <div style={{flex: 1, background: 'var(--border)', height: '1px', margin: '0 10px', borderRadius: '4px'}}></div>
                  <div style={{fontSize: '0.68rem', color: 'var(--muted-2)'}}>{t('homeHow.dashUrl')}</div>
                </div>

                <div style={{fontSize: '0.72rem', color: 'var(--muted-2)', marginBottom: '12px', letterSpacing: '.06em', textTransform: 'uppercase'}}>
                  {t('homeHow.seasonSum')}
                </div>

                <div className="hv-metric-row">
                  <div className="hv-metric">
                    <div className="hv-metric-label">{t('homeHow.totalCane')}</div>
                    <div className="hv-metric-val green">2,84,631</div>
                  </div>
                  <div className="hv-metric">
                    <div className="hv-metric-label">{t('homeHow.pendingPay')}</div>
                    <div className="hv-metric-val amber">₹43.2L</div>
                  </div>
                  <div className="hv-metric">
                    <div className="hv-metric-label">{t('homeHow.activeFarmers')}</div>
                    <div className="hv-metric-val">3,812</div>
                  </div>
                  <div className="hv-metric">
                    <div className="hv-metric-label">{t('homeHow.gangsDeployed')}</div>
                    <div className="hv-metric-val green">214</div>
                  </div>
                </div>

                <div style={{fontSize: '0.68rem', color: 'var(--muted-2)', margin: '16px 0 10px', letterSpacing: '.06em', textTransform: 'uppercase'}}>{t('homeHow.distContrib')}</div>
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
              <div className="sec-tag" style={{display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.075a2 2 0 0 1-2.84-2.84l7.73-7.73a2 2 0 0 1 2.84 2.84l-7.73 7.73ZM11.42 15.075l-4.24 4.24M11.42 15.075l4.24-4.24M6.42 16.075a2 2 0 1 1-2.84-2.84l2.84 2.84Z" />
                </svg>
                {t('home.tagFeatures')}
              </div>
              <h2 className="sec-title">{t('home.titleFeatures1')}<br/><em>{t('home.titleFeatures2')}</em></h2>
              <p className="sec-sub" style={{marginTop: '16px'}}>{t('home.descFeatures')}</p>
            </div>
          </div>

          <div className="features-grid reveal">
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg></div>
              <div className="feat-title">{t('homeFeatGrid.feat1Title')}</div>
              <p className="feat-body">{t('homeFeatGrid.feat1Desc')}</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/></svg></div>
              <div className="feat-title">{t('homeFeatGrid.feat2Title')}</div>
              <p className="feat-body">{t('homeFeatGrid.feat2Desc')}</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg></div>
              <div className="feat-title">{t('homeFeatGrid.feat3Title')}</div>
              <p className="feat-body">{t('homeFeatGrid.feat3Desc')}</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z"/></svg></div>
              <div className="feat-title">{t('homeFeatGrid.feat4Title')}</div>
              <p className="feat-body">{t('homeFeatGrid.feat4Desc')}</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg></div>
              <div className="feat-title">{t('homeFeatGrid.feat5Title')}</div>
              <p className="feat-body">{t('homeFeatGrid.feat5Desc')}</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg></div>
              <div className="feat-title">{t('homeFeatGrid.feat6Title')}</div>
              <p className="feat-body">{t('homeFeatGrid.feat6Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container" style={{position: 'relative', zIndex: 2}}>
          <div className="reveal">
            <div className="sec-tag" style={{justifyContent: 'center'}}>{t('home.joinPlatform')}</div>
            <h2 className="sec-title">{t('home.readyMod1')}<br/><em>{t('home.readyMod2')}</em></h2>
            <p className="sec-sub">{t('home.regToday')}</p>
          </div>
          <div className="cta-band-actions reveal reveal-d1">
            <a href="/signup" className="btn-hero" onClick={(e) => { e.preventDefault(); handleGetStarted(); }}>
              {t('home.createFree')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </a>
          </div>
          <p className="reveal reveal-d2" style={{marginTop: '28px', fontSize: '.78rem', color: 'var(--muted-2)'}}>{t('home.noComplex')}</p>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-brand" style={{display: 'inline-flex'}} onClick={(e) => e.preventDefault()}>
              <div className="nav-brand-dot"></div>
              <span className="nav-brand-name">{t('footer.canesetuTitle')}</span>
            </a>
            <p>{t('footer.canesetuDesc')}</p>
          </div>
          <div className="footer-col">
            <h5>{t('footer.footPlatform')}</h5>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Farmer'); }}>{t('footer.platFarmer')}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('HHM'); }}>{t('footer.platHHM')}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Labour'); }}>{t('footer.platWorkers')}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleGuideBoxClick('Factory'); }}>{t('footer.platFactories')}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>{t('footer.footProject')}</h5>
            <ul>
              <li><a href="#about" style={{}} onClick={(e) => e.preventDefault()}>{t('footer.projAbout')}</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>{t('footer.projMod')}</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>{t('footer.projFeat')}</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>{t('footer.projDoc')}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>{t('footer.footSupport')}</h5>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>{t('footer.supportHelp')}</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>{t('footer.supportContact')}</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>{t('footer.supportSysInfo')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">{t('footer.copyright')}</div>
          <div className="footer-legal">
            <a href="#" onClick={(e) => e.preventDefault()}>{t('footer.privacy')}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('footer.terms')}</a>
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
