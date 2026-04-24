import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css';

const FarmerProfile = () => {
  const navigate = useNavigate();

  // --- BUSINESS LOGIC & STATE (STRICTLY PRESERVED) ---
  const [showSave, setShowSave] = useState(false);
  const [pulseSave, setPulseSave] = useState(false);
    
  // --- VIEWPORT THEMING ---
  useEffect(() => {
    // Apply dark theme to body when profile is mounted
    document.body.style.backgroundColor = '#0b0f0b';
    document.body.classList.add('fp-active-theme');
    
    return () => {
      // Restore default theme on unmount
      document.body.style.backgroundColor = '';
      document.body.classList.remove('fp-active-theme');
    };
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    farmSize: '',
    experience: '',
    irrigation: 'drip',
    farmingMethods: '',
  });

  const [crops, setCrops] = useState([]);
  const [cropInput, setCropInput] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [equipInput, setEquipInput] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initials, setInitials] = useState('FP');
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get('/api/farmer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          const profile = res.data.profile;
          
          setFormData({
            fullName: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            farmSize: profile.farmSize || '',
            experience: profile.farmingExperience || '',
            irrigation: profile.irrigationType || 'drip',
            farmingMethods: profile.farmingMethods || '',
          });

          // Handle comma-separated string lists from the backend models
          if (profile.cropTypes) setCrops(profile.cropTypes.split(',').map(c => c.trim()).filter(c => c));
          if (profile.equipment) setEquipment(profile.equipment.split(',').map(e => e.trim()).filter(e => e));
          if (profile.certifications) setCertifications(profile.certifications.split(',').map(c => c.trim()).filter(c => c));

          if (profile.name) {
            const names = profile.name.split(' ');
            if (names.length >= 2) {
              setInitials(names[0][0].toUpperCase() + names[1][0].toUpperCase());
            } else {
              setInitials(names[0].substring(0, 2).toUpperCase());
            }
          }
          
          calculateCompletion(profile);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const calculateCompletion = (profile) => {
    let completed = 0;
    const totalFields = 8;
    if (profile.name) completed++;
    if (profile.email) completed++;
    if (profile.phone) completed++;
    if (profile.location) completed++;
    if (profile.farmSize) completed++;
    if (profile.farmingExperience) completed++;
    if (profile.farmingMethods) completed++;
    if (profile.cropTypes) completed++;
    
    setProfileCompletion(Math.round((completed / totalFields) * 100));
  };

  // Handle cursor tracking

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setShowSave(true);
  };

  const handleChipKey = (e, val, setVal, list, setList) => {
    if ((e.key === 'Enter' || e.key === ',') && val.trim()) {
      e.preventDefault();
      const clean = val.replace(',', '').trim();
      if (clean && !list.includes(clean)) setList([...list, clean]);
      setVal('');
      setShowSave(true);
    }
  };

  const removeItem = (item, list, setList) => {
    setList(list.filter(i => i !== item));
    setShowSave(true);
  };

  const addCert = () => {
    const name = window.prompt('Enter certification name:');
    if (name && name.trim() && !certifications.includes(name.trim())) {
      setCertifications([...certifications, name.trim()]);
      setShowSave(true);
    }
  };

  const handleSave = async () => {
    setShowSave(false);
    
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        farmSize: formData.farmSize,
        farmingExperience: formData.experience,
        farmingMethods: formData.farmingMethods,
        irrigationType: formData.irrigation,
        cropTypes: crops.join(', '),
        equipment: equipment.join(', '),
        certifications: certifications.join(', '),
      };

      const res = await axios.put('/api/farmer/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setPulseSave(true);
        setTimeout(() => setPulseSave(false), 800);
        calculateCompletion(res.data.profile);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save changes. Please try again.');
      setShowSave(true);
    }
  };

  const irrigationOptions = [
    { val: 'drip', icon: '💧', lbl: 'Drip' },
    { val: 'sprinkler', icon: '🌀', lbl: 'Sprinkler' },
    { val: 'flood', icon: '🏞️', lbl: 'Flood' },
    { val: 'rainfed', icon: '🌧️', lbl: 'Rain-fed' },
  ];

  if (isLoading) {
    return (
      <div className="farmer-profile-page" style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
      }}>
        <div style={{ color: 'var(--green)' }}>Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
      {/* CUSTOM CURSOR */}
      {/* BG FX (from reference design) */}
      <div className="fp-noise" />
      <div className="fp-bg-glow" />

      <div className="fp-layout-shell">
        {/* --- SIDEBAR --- */}
        <aside className="fp-sidebar">
          <div className="fp-sidebar-profile">
            <div className="fp-avatar-wrap">
              <div className="fp-avatar">{initials}</div>
              <div className="fp-avatar-ring"></div>
            </div>
            <div className="fp-user-name">{formData.fullName || 'No Name Set'}</div>
            <div className="fp-user-role">
              <span className="fp-role-dot"></span>
              Farmer
            </div>
          </div>

          <div className="fp-stats-grid">
            <div className="fp-stat-item">
              <div className="fp-stat-val">{formData.farmSize ? formData.farmSize.replace(/[^0-9]/g, '') || '-' : '-'}</div>
              <div className="fp-stat-lbl">Acres owned</div>
            </div>
            <div className="fp-stat-item">
              <div className="fp-stat-val">{formData.experience ? formData.experience.replace(/[^0-9]/g, '') || '-' : '-'}yr</div>
              <div className="fp-stat-lbl">Experience</div>
            </div>
            <div className="fp-stat-item">
              <div className="fp-stat-val">{crops.length}</div>
              <div className="fp-stat-lbl">Crops grown</div>
            </div>
            <div className="fp-stat-item">
              <div className="fp-stat-val">{certifications.length}</div>
              <div className="fp-stat-lbl">Certifications</div>
            </div>
          </div>

        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="fp-main">
          
          {/* PROFILE COMPLETION */}
          {profileCompletion < 100 && (
            <div className="fp-completion-bar">
              <div className="fp-completion-left">
                <div className="fp-completion-pct">{profileCompletion}%</div>
              </div>
              <div className="fp-completion-right">
                <div className="fp-completion-title">Profile completion</div>
                <div className="fp-completion-track">
                  <div className="fp-completion-fill" style={{ width: `${profileCompletion}%` }}></div>
                </div>
                <p className="fp-completion-hint">Add your Aadhaar number and bank details to unlock automated FRP payments</p>
              </div>
            </div>
          )}

          {/* PAGE HEADER */}
          <div className="fp-page-header">
            <div className="fp-header-left">
              <div className="fp-eyebrow">Farmer Profile</div>
              <h1 className="fp-title">Your <em className="fp-highlight">profile</em></h1>
              <p className="fp-subtitle">Manage farm details, personal information, and certifications</p>
            </div>
            <div className="fp-header-right">
              <button 
                className={`fp-btn-save-top ${pulseSave ? 'pulse' : ''}`} 
                onClick={handleSave} >
                {pulseSave ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* SECTION 1: FARMER INFORMATION */}
          <section className="fp-card">
            <div className="fp-card-header">
              <div className="fp-card-icon">🌾</div>
              <div className="fp-card-txt">
                <h2 className="fp-card-title">Farmer Information</h2>
                <div className="fp-card-sub">Your personal and contact details</div>
              </div>
            </div>
            <div className="fp-card-body">
              <div className="fp-form-grid">
                <div className="fp-field">
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" />
                </div>
                <div className="fp-field">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                </div>
                <div className="fp-field">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="fp-field">
                  <label>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Village / Taluka, District" />
                </div>
                <div className="fp-field">
                  <label>Farm Size</label>
                  <input type="text" name="farmSize" value={formData.farmSize} onChange={handleChange} placeholder="e.g. 25 acres" />
                </div>
                <div className="fp-field">
                  <label>Farming Experience</label>
                  <input type="text" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 12 years" />
                </div>

                {/* CHIP INPUT (CROPS) */}
                <div className="fp-field full">
                  <label>Primary Crops</label>
                  <div className="fp-chip-container">
                    {crops.map((c, i) => (
                      <span key={i} className="fp-chip">
                        {c}
                        <button className="fp-chip-x" onClick={() => removeItem(c, crops, setCrops)} >×</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={cropInput} 
                      onChange={e => setCropInput(e.target.value)} 
                      onKeyDown={e => handleChipKey(e, cropInput, setCropInput, crops, setCrops)}
                      placeholder="Add crop..." 
                    />
                  </div>
                  <div className="fp-input-hint">Press Enter or comma to add</div>
                </div>

                {/* IRRIGATION SELECTOR */}
                <div className="fp-field full">
                  <label>Irrigation Type</label>
                  <div className="fp-radio-grid">
                    {irrigationOptions.map(opt => (
                      <div 
                        key={opt.val} 
                        className={`fp-radio-tile ${formData.irrigation === opt.val ? 'selected' : ''}`}
                        onClick={() => { setFormData({...formData, irrigation: opt.val}); setShowSave(true); }} >
                        <span className="fp-tile-icon">{opt.icon}</span>
                        <span className="fp-tile-label">{opt.lbl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: FARM EQUIPMENT */}
          <section className="fp-card">
            <div className="fp-card-header">
              <div className="fp-card-icon">🚜</div>
              <div className="fp-card-txt">
                <h2 className="fp-card-title">Farm Equipment &amp; Technology</h2>
                <div className="fp-card-sub">Equipment you own and methods you practice</div>
              </div>
            </div>
            <div className="fp-card-body">
              <div className="fp-form-grid">
                <div className="fp-field full">
                  <label>Available Equipment</label>
                  <div className="fp-chip-container">
                    {equipment.map((eq, i) => (
                      <span key={i} className="fp-chip">
                        {eq}
                        <button className="fp-chip-x" onClick={() => removeItem(eq, equipment, setEquipment)} >×</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={equipInput} 
                      onChange={e => setEquipInput(e.target.value)} 
                      onKeyDown={e => handleChipKey(e, equipInput, setEquipInput, equipment, setEquipment)}
                      placeholder="Add equipment..." 
                    />
                  </div>
                </div>

                <div className="fp-field full">
                  <label>Farming Methods</label>
                  <textarea name="farmingMethods" value={formData.farmingMethods} onChange={handleChange} placeholder="Describe your farming methods..." />
                </div>

                {/* CERTIFICATIONS */}
                <div className="fp-field full">
                  <label>Certifications</label>
                  <div className="fp-cert-grid">
                    {certifications.map((cert, i) => (
                      <div key={i} className="fp-cert-badge">
                        <span className="fp-cert-check">✓</span>
                        {cert}
                        <button className="fp-cert-del" onClick={() => removeItem(cert, certifications, setCertifications)} >×</button>
                      </div>
                    ))}
                    <button className="fp-cert-add" onClick={addCert} >
                      + Add certification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* --- STICKY SAVE BAR --- */}
      <div className={`fp-sticky-save ${showSave ? 'visible' : ''}`}>
        <div className="fp-sticky-inner">
          <div className="fp-sticky-msg">
            <div className="fp-pulse-dot"></div>
            <strong>Unsaved changes</strong> — save to update your profile
          </div>
          <div className="fp-sticky-btns">
            <button className="fp-btn-discard" onClick={() => setShowSave(false)} >Discard</button>
            <button className="fp-btn-save-sticky" onClick={handleSave} >Save Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;
