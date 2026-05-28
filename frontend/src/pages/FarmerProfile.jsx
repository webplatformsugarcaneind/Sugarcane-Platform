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
    cropVariety: '',
    estimatedYield: '',
    cropStatus: 'Standing Crop',
    farmType: '',
    preferredHarvestDate: '',
    workersNeeded: '',
    harvestType: 'Manual',
    transportRequired: true,
    loadingSupport: false,
    machineRequired: 'Manual Preferred',
    urgencyLevel: 'Normal Season',
    village: '',
    region: '',
    district: '',
    distanceFromFactory: '',
    roadAccessibility: 'Truck Accessible',
    loadingPoint: '',
    harvestWindow: '',
    dailyHours: '',
    shiftPreference: 'Day Shift',
    peakDays: '',
    contractStatus: 'Open for Proposals',
    preferredPayment: 'Bank Transfer',
    previousContractType: 'Seasonal',
    advanceRequired: false,
    settlementPreference: 'Per Harvest Cycle',
    seasonsCompleted: 0,
    reliabilityRating: 0,
    trackRecord: '',
    description: '',
    contactPreference: 'Any'
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
            cropVariety: profile.cropVariety || '',
            estimatedYield: profile.estimatedYield || '',
            cropStatus: profile.cropStatus || 'Standing Crop',
            farmType: profile.farmType || '',
            preferredHarvestDate: profile.preferredHarvestDate ? new Date(profile.preferredHarvestDate).toISOString().split('T')[0] : '',
            workersNeeded: profile.workersNeeded || '',
            harvestType: profile.harvestType || 'Manual',
            transportRequired: profile.transportRequired ?? true,
            loadingSupport: profile.loadingSupport ?? false,
            machineRequired: profile.machineRequired || 'Manual Preferred',
            urgencyLevel: profile.urgencyLevel || 'Normal Season',
            village: profile.village || '',
            region: profile.region || '',
            district: profile.district || '',
            distanceFromFactory: profile.distanceFromFactory || '',
            roadAccessibility: profile.roadAccessibility || 'Truck Accessible',
            loadingPoint: profile.loadingPoint || '',
            harvestWindow: profile.harvestWindow || '',
            dailyHours: profile.dailyHours || '',
            shiftPreference: profile.shiftPreference || 'Day Shift',
            peakDays: profile.peakDays || '',
            contractStatus: profile.contractStatus || 'Open for Proposals',
            preferredPayment: profile.preferredPayment || 'Bank Transfer',
            previousContractType: profile.previousContractType || 'Seasonal',
            advanceRequired: profile.advanceRequired ?? false,
            settlementPreference: profile.settlementPreference || 'Per Harvest Cycle',
            seasonsCompleted: profile.seasonsCompleted || 0,
            reliabilityRating: profile.reliabilityRating || 0,
            trackRecord: profile.trackRecord || '',
            description: profile.description || '',
            contactPreference: profile.contactPreference || 'Any'
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
        cropVariety: formData.cropVariety,
        estimatedYield: formData.estimatedYield,
        cropStatus: formData.cropStatus,
        farmType: formData.farmType,
        preferredHarvestDate: formData.preferredHarvestDate || null,
        workersNeeded: formData.workersNeeded,
        harvestType: formData.harvestType,
        transportRequired: formData.transportRequired,
        loadingSupport: formData.loadingSupport,
        machineRequired: formData.machineRequired,
        urgencyLevel: formData.urgencyLevel,
        village: formData.village,
        region: formData.region,
        district: formData.district,
        distanceFromFactory: formData.distanceFromFactory,
        roadAccessibility: formData.roadAccessibility,
        loadingPoint: formData.loadingPoint,
        harvestWindow: formData.harvestWindow,
        dailyHours: formData.dailyHours,
        shiftPreference: formData.shiftPreference,
        peakDays: formData.peakDays,
        contractStatus: formData.contractStatus,
        preferredPayment: formData.preferredPayment,
        previousContractType: formData.previousContractType,
        advanceRequired: formData.advanceRequired,
        settlementPreference: formData.settlementPreference,
        seasonsCompleted: formData.seasonsCompleted,
        reliabilityRating: formData.reliabilityRating,
        trackRecord: formData.trackRecord,
        description: formData.description,
        contactPreference: formData.contactPreference
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

  const IrrigationIcons = {
    drip: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c0 0-6 7.5-6 11.25a6 6 0 0 0 12 0C18 9.75 12 2.25 12 2.25Z" />
      </svg>
    ),
    sprinkler: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m4.22.78 1.42-1.42M21 12h-2M18.36 18.36l-1.42-1.42M12 21v-2M7.05 18.95 5.64 20.36M3 12h2M5.64 5.64l1.41 1.41" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    flood: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10l-1 9H8L7 3Z" />
      </svg>
    ),
    rainfed: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5c0-1.657 1.343-3 3-3s3 1.343 3 3S8.657 10.5 6 10.5 3 9.157 3 7.5Zm9-3c0-2.485 2.015-4.5 4.5-4.5S21 2.015 21 4.5 18.985 9 16.5 9 12 6.985 12 4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 14v1m0 2v1m4-4v1m0 2v1m4-4v1m0 2v1" />
      </svg>
    ),
  };

  const irrigationOptions = [
    { val: 'drip',      lbl: 'Drip' },
    { val: 'sprinkler', lbl: 'Sprinkler' },
    { val: 'flood',     lbl: 'Flood' },
    { val: 'rainfed',   lbl: 'Rain-fed' },
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
          

          {/* PAGE HEADER */}
          <div className="fp-page-header">
            <div className="fp-header-left">
              <div className="fp-eyebrow">Farmer Profile</div>
              <h1 className="fp-title">Your <em className="fp-highlight">profile</em></h1>
              <p className="fp-subtitle">Manage farm details, personal information, and certifications</p>
            </div>
            <div className="fp-header-right">
              <button 
                className={`btn-base btn-primary ${pulseSave ? 'pulse' : ''}`} 
                onClick={handleSave} >
                {pulseSave ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* SECTION 1: FARMER INFORMATION */}
          <section className="fp-card">
            <div className="fp-card-header">
              <div className="fp-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
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
                        <span className="fp-tile-icon">{IrrigationIcons[opt.val]}</span>
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
              <div className="fp-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                </svg>
              </div>
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

          {/* SECTION 3: CROP & HARVEST INFO */}
          <section className="fp-card">
            <div className="fp-card-header">
              <div className="fp-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              </div>
              <div className="fp-card-txt">
                <h2 className="fp-card-title">Crop & Harvest Details</h2>
                <div className="fp-card-sub">Crop status, variety and tonnage estimates</div>
              </div>
            </div>
            <div className="fp-card-body">
              <div className="fp-form-grid">
                <div className="fp-field">
                  <label>Crop Variety</label>
                  <input type="text" name="cropVariety" value={formData.cropVariety} onChange={handleChange} placeholder="e.g. Co 86032" />
                </div>
                <div className="fp-field">
                  <label>Estimated Yield (Tons)</label>
                  <input type="text" name="estimatedYield" value={formData.estimatedYield} onChange={handleChange} placeholder="e.g. 1500" />
                </div>
                <div className="fp-field">
                  <label>Crop Status</label>
                  <select name="cropStatus" value={formData.cropStatus} onChange={handleChange}>
                    <option value="Standing Crop">Standing Crop</option>
                    <option value="Ready for Harvest">Ready for Harvest</option>
                    <option value="Harvesting in Progress">Harvesting in Progress</option>
                  </select>
                </div>
                <div className="fp-field">
                  <label>Farm Type</label>
                  <input type="text" name="farmType" value={formData.farmType} onChange={handleChange} placeholder="e.g. Organic" />
                </div>
                <div className="fp-field">
                  <label>Preferred Harvest Date</label>
                  <input type="date" name="preferredHarvestDate" value={formData.preferredHarvestDate} onChange={handleChange} />
                </div>
                <div className="fp-field">
                  <label>Workers Needed</label>
                  <input type="text" name="workersNeeded" value={formData.workersNeeded} onChange={handleChange} placeholder="e.g. 50" />
                </div>
                <div className="fp-field">
                  <label>Harvest Type</label>
                  <select name="harvestType" value={formData.harvestType} onChange={handleChange}>
                    <option value="Manual">Manual</option>
                    <option value="Machine">Machine</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="fp-field">
                  <label>Machine Required</label>
                  <select name="machineRequired" value={formData.machineRequired} onChange={handleChange}>
                    <option value="Manual Preferred">Manual Preferred</option>
                    <option value="Harvester Required">Harvester Required</option>
                    <option value="Loader Required">Loader Required</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: LOCATION & LOGISTICS */}
          <section className="fp-card">
            <div className="fp-card-header">
              <div className="fp-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <div className="fp-card-txt">
                <h2 className="fp-card-title">Location & Logistics</h2>
                <div className="fp-card-sub">Field access, road conditions and distance</div>
              </div>
            </div>
            <div className="fp-card-body">
              <div className="fp-form-grid">
                <div className="fp-field">
                  <label>Village / Taluka</label>
                  <input type="text" name="village" value={formData.village} onChange={handleChange} placeholder="Village Name" />
                </div>
                <div className="fp-field">
                  <label>District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District Name" />
                </div>
                <div className="fp-field">
                  <label>Distance from Factory (km)</label>
                  <input type="text" name="distanceFromFactory" value={formData.distanceFromFactory} onChange={handleChange} placeholder="e.g. 25 km" />
                </div>
                <div className="fp-field">
                  <label>Road Accessibility</label>
                  <select name="roadAccessibility" value={formData.roadAccessibility} onChange={handleChange}>
                    <option value="Truck Accessible">Truck Accessible</option>
                    <option value="Tractor Only">Tractor Only</option>
                    <option value="Poor/Mud Road">Poor/Mud Road</option>
                  </select>
                </div>
                <div className="fp-field">
                  <label>Transport Required</label>
                  <select name="transportRequired" value={formData.transportRequired} onChange={(e) => { setFormData({...formData, transportRequired: e.target.value === 'true'}); setShowSave(true); }}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="fp-field">
                  <label>Loading Support</label>
                  <select name="loadingSupport" value={formData.loadingSupport} onChange={(e) => { setFormData({...formData, loadingSupport: e.target.value === 'true'}); setShowSave(true); }}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: SCHEDULE & CONTRACT */}
          <section className="fp-card">
            <div className="fp-card-header">
              <div className="fp-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <div className="fp-card-txt">
                <h2 className="fp-card-title">Payment & Contract</h2>
                <div className="fp-card-sub">Settlement preferences and contract type</div>
              </div>
            </div>
            <div className="fp-card-body">
              <div className="fp-form-grid">
                <div className="fp-field">
                  <label>Contract Status</label>
                  <select name="contractStatus" value={formData.contractStatus} onChange={handleChange}>
                    <option value="Open for Proposals">Open for Proposals</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Contracted">Contracted</option>
                  </select>
                </div>
                <div className="fp-field">
                  <label>Payment Method</label>
                  <select name="preferredPayment" value={formData.preferredPayment} onChange={handleChange}>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="fp-field">
                  <label>Settlement Preference</label>
                  <select name="settlementPreference" value={formData.settlementPreference} onChange={handleChange}>
                    <option value="Per Harvest Cycle">Per Harvest Cycle</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div className="fp-field">
                  <label>Advance Required</label>
                  <select name="advanceRequired" value={formData.advanceRequired} onChange={(e) => { setFormData({...formData, advanceRequired: e.target.value === 'true'}); setShowSave(true); }}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="fp-field full">
                  <label>Description / Additional Notes</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Any specific requirements or details..." />
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
            <button className="btn-base btn-outline" onClick={() => setShowSave(false)} style={{ border: 'none' }}>Discard</button>
            <button className="btn-base btn-primary" onClick={handleSave}>Save Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;
