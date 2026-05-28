import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '../utils/authUtils';
import './FarmerProfile.css'; // Unified dark theme CSS
import './ProfilePage.css';  // Sticky save bar

/* ─────────────────────────────────────────────
   Inline SVG icon set (no emoji)
───────────────────────────────────────────── */
const Icon = {
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Farm: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12 12 2.25 21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  Harvest: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  Contract: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  Location: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  Factory: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205v3m-5.25-9h-.008v.008h.008V3.75Z" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  ),
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
    </svg>
  ),
  Wrench: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
    </svg>
  ),
  Payment: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   Helper: section card wrapper
───────────────────────────────────────────── */
const Section = ({ icon: IconComp, title, children }) => (
  <section className="fp-card">
    <div className="fp-card-header">
      <div className="fp-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'rgba(126,200,67,0.12)', borderRadius: 10, color: 'var(--green)' }}>
        <IconComp />
      </div>
      <div className="fp-card-txt">
        <h2 className="fp-card-title">{title}</h2>
      </div>
    </div>
    <div className="fp-card-body">
      <div className="fp-form-grid">
        {children}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   Helper: individual field wrappers
───────────────────────────────────────────── */
const Field = ({ label, half, children, hint }) => (
  <div className={`fp-field${half === false ? ' full-width' : ''}`}>
    <label>{label}{hint && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', marginLeft: 6 }}>{hint}</span>}</label>
    {children}
  </div>
);

const Input = ({ name, type = 'text', value, onChange, placeholder, readOnly, min, max, style }) => (
  <input
    type={type}
    name={name}
    value={value || ''}
    onChange={onChange}
    className="fp-input"
    placeholder={placeholder}
    readOnly={readOnly}
    min={min}
    max={max}
    style={readOnly ? { opacity: 0.5, ...style } : style}
  />
);

const Textarea = ({ name, value, onChange, rows = 3, placeholder }) => (
  <textarea name={name} value={value || ''} onChange={onChange} rows={rows} className="fp-input" placeholder={placeholder} />
);

const Select = ({ name, value, onChange, options }) => (
  <select name={name} value={value || ''} onChange={onChange} className="fp-input" style={{ appearance: 'auto', background: '#0b0f0b', color: 'white' }}>
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

const CheckField = ({ name, checked, onChange, label }) => (
  <div className="fp-field" style={{ display: 'flex', alignItems: 'center' }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <input type="checkbox" name={name} checked={!!checked} onChange={onChange} style={{ width: 18, height: 18 }} />
      {label}
    </label>
  </div>
);

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userRole, setUserRole] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role || '');
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('No authentication token found'); return; }

      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : {};
      const endpoints = { Labour: '/api/labour/profile', Factory: '/api/factory/profile', HHM: '/api/hhm/profile', Farmer: '/api/farmer/profile' };
      const apiEndpoint = endpoints[user.role] || '/api/farmer/profile';

      const response = await axios.get(apiEndpoint, { headers: { Authorization: `Bearer ${token}` } });
      const profile = response.data.profile || {};

      // Normalise arrays to comma-separated strings for text inputs
      ['skills', 'equipment', 'farmingMethods', 'certifications', 'managementOperations',
        'servicesOffered', 'specialization', 'workingAreas', 'workerTypes'].forEach(f => {
        if (Array.isArray(profile[f])) profile[f] = profile[f].join(', ');
      });

      // Normalize crushingStatus
      if (!profile.crushingStatus || profile.crushingStatus === false || profile.crushingStatus === 'false') {
        profile.crushingStatus = 'OFF';
      } else if (profile.crushingStatus === true || profile.crushingStatus === 'true') {
        profile.crushingStatus = 'ON';
      }

      // Flatten contactInfo for Factory
      if (user.role === 'Factory' && profile.contactInfo) {
        profile.website = profile.contactInfo.website || profile.website || '';
        profile.fax = profile.contactInfo.fax || '';
        profile.tollfree = profile.contactInfo.tollfree || '';
        profile.landline = profile.contactInfo.landline || '';
      }

      // Format dates for date inputs
      if (profile.preferredHarvestDate) {
        profile.preferredHarvestDate = new Date(profile.preferredHarvestDate).toISOString().split('T')[0];
      }
      if (profile.harvestDate) {
        profile.harvestDate = new Date(profile.harvestDate).toISOString().split('T')[0];
      }

      setProfileData(profile);
      setSavedSnapshot(profile);
      setHasChanges(false);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => {
      const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
      setHasChanges(JSON.stringify(newData) !== JSON.stringify(savedSnapshot));
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const endpoints = { Labour: '/api/labour/profile', Factory: '/api/factory/profile', HHM: '/api/hhm/profile', Farmer: '/api/farmer/profile' };
      const apiEndpoint = endpoints[userRole] || '/api/farmer/profile';

      const updateData = { ...profileData };

      // Re-build contactInfo for Factory before sending
      if (userRole === 'Factory') {
        updateData.contactInfo = {
          website: updateData.website || '',
          fax: updateData.fax || '',
          tollfree: updateData.tollfree || '',
          landline: updateData.landline || '',
        };
      }

      const response = await axios.put(apiEndpoint, updateData, { headers: { Authorization: `Bearer ${token}` } });
      setSuccessMessage(response.data.message || 'Profile updated successfully!');
      setSavedSnapshot(profileData);
      setHasChanges(false);

      if (updateData.name) {
        const ud = JSON.parse(localStorage.getItem('user') || '{}');
        ud.name = updateData.name;
        localStorage.setItem('user', JSON.stringify(ud));
        window.dispatchEvent(new Event('userUpdated'));
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(handleApiError(err) || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="farmer-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b' }}>
        <div style={{ color: 'var(--green)' }}>Loading Profile...</div>
      </div>
    );
  }

  const initials = profileData.name ? profileData.name.substring(0, 2).toUpperCase() : (userRole.substring(0, 2).toUpperCase() || 'US');
  const p = profileData;
  const onChange = handleInputChange;

  /* ── FARMER ──────────────────────────────── */
  const renderFarmerProfile = () => (
    <>
      <Section icon={Icon.User} title="Personal Information">
        <Field label="Full Name" half={false}><Input name="name" value={p.name} onChange={onChange} /></Field>
        <Field label="Email" hint="(Read Only)"><Input name="email" type="email" value={p.email} readOnly /></Field>
        <Field label="Phone Number"><Input name="phone" type="tel" value={p.phone} onChange={onChange} /></Field>
        <Field label="Primary Location" half={false}><Input name="location" value={p.location} onChange={onChange} placeholder="e.g., Nashik, Maharashtra" /></Field>
        <Field label="Village"><Input name="village" value={p.village} onChange={onChange} placeholder="e.g., Loni" /></Field>
        <Field label="Taluka / Region"><Input name="region" value={p.region} onChange={onChange} placeholder="e.g., Rahata" /></Field>
        <Field label="District"><Input name="district" value={p.district} onChange={onChange} placeholder="e.g., Ahmednagar" /></Field>
      </Section>

      <Section icon={Icon.Farm} title="Farm Details">
        <Field label="Farm Size"><Input name="farmSize" value={p.farmSize} onChange={onChange} placeholder="e.g., 25 acres" /></Field>
        <Field label="Farming Experience"><Input name="farmingExperience" value={p.farmingExperience} onChange={onChange} placeholder="e.g., 12 years" /></Field>
        <Field label="Farm Type"><Input name="farmType" value={p.farmType} onChange={onChange} placeholder="e.g., Irrigated, Rain-fed" /></Field>
        <Field label="Primary Crops" half={false}><Input name="cropTypes" value={p.cropTypes} onChange={onChange} placeholder="e.g., Sugarcane, Wheat" /></Field>
        <Field label="Crop Variety" half={false}><Input name="cropVariety" value={p.cropVariety} onChange={onChange} placeholder="e.g., Co-86032, CoM-0265" /></Field>
        <Field label="Estimated Yield"><Input name="estimatedYield" value={p.estimatedYield} onChange={onChange} placeholder="e.g., 120 tonnes/acre" /></Field>
        <Field label="Crop Status">
          <Select name="cropStatus" value={p.cropStatus} onChange={onChange} options={[
            ['Standing Crop', 'Standing Crop'], ['Ready for Harvest', 'Ready for Harvest'],
            ['Harvested', 'Harvested'], ['Pre-Planting', 'Pre-Planting']
          ]} />
        </Field>
        <Field label="Farming Methods" half={false}><Input name="farmingMethods" value={p.farmingMethods} onChange={onChange} placeholder="e.g., Organic, Drip irrigation" /></Field>
        <Field label="Equipment Owned" half={false}><Input name="equipment" value={p.equipment} onChange={onChange} placeholder="e.g., Tractor, Harvester" /></Field>
        <Field label="Certifications"><Input name="certifications" value={p.certifications} onChange={onChange} placeholder="e.g., Organic Certificate" /></Field>
        <Field label="Irrigation Type">
          <Select name="irrigationType" value={p.irrigationType || 'drip'} onChange={onChange} options={[
            ['drip', 'Drip'], ['sprinkler', 'Sprinkler'], ['flood', 'Flood'], ['rainfed', 'Rain-fed']
          ]} />
        </Field>
      </Section>

      <Section icon={Icon.Harvest} title="Harvest & Logistics">
        <Field label="Preferred Harvest Date"><Input name="preferredHarvestDate" type="date" value={p.preferredHarvestDate} onChange={onChange} /></Field>
        <Field label="Harvest Window"><Input name="harvestWindow" value={p.harvestWindow} onChange={onChange} placeholder="e.g., Oct 15 – Nov 30" /></Field>
        <Field label="Harvest Type">
          <Select name="harvestType" value={p.harvestType || 'Manual'} onChange={onChange} options={[
            ['Manual', 'Manual'], ['Machine', 'Machine'], ['Mixed', 'Mixed']
          ]} />
        </Field>
        <Field label="Workers Needed"><Input name="workersNeeded" value={p.workersNeeded} onChange={onChange} placeholder="e.g., 20" /></Field>
        <Field label="Urgency Level">
          <Select name="urgencyLevel" value={p.urgencyLevel || 'Normal Season'} onChange={onChange} options={[
            ['Normal Season', 'Normal Season'], ['Moderate', 'Moderate'], ['High Priority', 'High Priority'], ['Emergency', 'Emergency']
          ]} />
        </Field>
        <Field label="Machine Required"><Input name="machineRequired" value={p.machineRequired} onChange={onChange} placeholder="e.g., Manual Preferred" /></Field>
        <Field label="Distance from Factory"><Input name="distanceFromFactory" value={p.distanceFromFactory} onChange={onChange} placeholder="e.g., 8 km" /></Field>
        <Field label="Road Accessibility">
          <Select name="roadAccessibility" value={p.roadAccessibility || 'Truck Accessible'} onChange={onChange} options={[
            ['Truck Accessible', 'Truck Accessible'], ['Tractor Only', 'Tractor Only'], ['Difficult Access', 'Difficult Access']
          ]} />
        </Field>
        <Field label="Loading Point"><Input name="loadingPoint" value={p.loadingPoint} onChange={onChange} placeholder="e.g., Farm gate, Village road" /></Field>
        <Field label="Shift Preference">
          <Select name="shiftPreference" value={p.shiftPreference || 'Day Shift'} onChange={onChange} options={[
            ['Day Shift', 'Day Shift'], ['Night Shift', 'Night Shift'], ['Flexible', 'Flexible']
          ]} />
        </Field>
        <Field label="Daily Hours"><Input name="dailyHours" value={p.dailyHours} onChange={onChange} placeholder="e.g., 8 hours" /></Field>
        <Field label="Peak Days"><Input name="peakDays" value={p.peakDays} onChange={onChange} placeholder="e.g., Mon-Sat" /></Field>
        <CheckField name="transportRequired" checked={p.transportRequired} onChange={onChange} label="Transport Required" />
        <CheckField name="loadingSupport" checked={p.loadingSupport} onChange={onChange} label="Loading Support Available" />
      </Section>

      <Section icon={Icon.Contract} title="Contract & Payment Preferences">
        <Field label="Contract Status">
          <Select name="contractStatus" value={p.contractStatus || 'Open for Proposals'} onChange={onChange} options={[
            ['Open for Proposals', 'Open for Proposals'], ['Under Negotiation', 'Under Negotiation'],
            ['Contracted', 'Contracted'], ['Closed', 'Closed']
          ]} />
        </Field>
        <Field label="Preferred Payment">
          <Select name="preferredPayment" value={p.preferredPayment || 'Bank Transfer'} onChange={onChange} options={[
            ['Bank Transfer', 'Bank Transfer'], ['Cash', 'Cash'], ['Cheque', 'Cheque'], ['UPI', 'UPI']
          ]} />
        </Field>
        <Field label="Settlement Preference">
          <Select name="settlementPreference" value={p.settlementPreference || 'Per Harvest Cycle'} onChange={onChange} options={[
            ['Per Harvest Cycle', 'Per Harvest Cycle'], ['Monthly', 'Monthly'], ['On Completion', 'On Completion']
          ]} />
        </Field>
        <Field label="Previous Contract Type">
          <Select name="previousContractType" value={p.previousContractType || 'Seasonal'} onChange={onChange} options={[
            ['Seasonal', 'Seasonal'], ['Annual', 'Annual'], ['Spot', 'Spot']
          ]} />
        </Field>
        <Field label="Contact Preference">
          <Select name="contactPreference" value={p.contactPreference || 'Any'} onChange={onChange} options={[
            ['Any', 'Any'], ['Phone', 'Phone'], ['WhatsApp', 'WhatsApp'], ['In-Person', 'In-Person']
          ]} />
        </Field>
        <Field label="HHM Partnerships"><Input name="hhmPartnerships" type="number" value={p.hhmPartnerships || 0} onChange={onChange} min="0" /></Field>
        <Field label="Seasons Completed"><Input name="seasonsCompleted" type="number" value={p.seasonsCompleted || 0} onChange={onChange} min="0" /></Field>
        <Field label="Reliability Rating (0–10)"><Input name="reliabilityRating" type="number" value={p.reliabilityRating || 0} onChange={onChange} min="0" max="10" /></Field>
        <Field label="Track Record" half={false}><Textarea name="trackRecord" value={p.trackRecord} onChange={onChange} placeholder="Brief description of past seasons and performance" /></Field>
        <CheckField name="advanceRequired" checked={p.advanceRequired} onChange={onChange} label="Advance Payment Required" />
      </Section>
    </>
  );

  /* ── FACTORY ─────────────────────────────── */
  const renderFactoryProfile = () => (
    <>
      <Section icon={Icon.Factory} title="Factory Identity">
        <Field label="Representative Name" half={false}><Input name="name" value={p.name} onChange={onChange} /></Field>
        <Field label="Factory Name" half={false}><Input name="factoryName" value={p.factoryName} onChange={onChange} /></Field>
        <Field label="Factory Location" half={false}><Input name="factoryLocation" value={p.factoryLocation} onChange={onChange} /></Field>
        <Field label="Established Year"><Input name="establishedYear" value={p.establishedYear} onChange={onChange} placeholder="e.g., 1994" /></Field>
        <Field label="Operating Season"><Input name="operatingSeason" value={p.operatingSeason} onChange={onChange} placeholder="e.g., Oct–April" /></Field>
        <Field label="Factory Description" half={false}><Textarea name="factoryDescription" value={p.factoryDescription} onChange={onChange} placeholder="Brief description of the factory" /></Field>
        <Field label="General Description" half={false}><Textarea name="description" value={p.description} onChange={onChange} placeholder="Extended factory description" /></Field>
      </Section>

      <Section icon={Icon.Wrench} title="Operations & Capacity">
        <Field label="Specialization" half={false}><Input name="specialization" value={p.specialization} onChange={onChange} placeholder="e.g., Sugar Processing, Ethanol" /></Field>
        <Field label="Experience"><Input name="experience" value={p.experience} onChange={onChange} placeholder="e.g., 25 years" /></Field>
        <Field label="Capacity"><Input name="capacity" value={p.capacity} onChange={onChange} placeholder="e.g., 5000 TCD" /></Field>
        <Field label="Crushing Status" half={false}>
          <Select name="crushingStatus" value={p.crushingStatus || 'OFF'} onChange={onChange} options={[
            ['ON', '🟢 ON (Active)'], ['OFF', '🔴 OFF (Inactive)']
          ]} />
        </Field>
      </Section>

      <Section icon={Icon.Phone} title="Contact Information">
        <Field label="Email"><Input name="email" type="email" value={p.email} onChange={onChange} /></Field>
        <Field label="Phone"><Input name="phone" type="tel" value={p.phone} onChange={onChange} /></Field>
        <Field label="Website"><Input name="website" type="url" value={p.website} onChange={onChange} placeholder="https://factory.com" /></Field>
        <Field label="Landline"><Input name="landline" value={p.landline} onChange={onChange} placeholder="02165-XXXXXX" /></Field>
        <Field label="Fax"><Input name="fax" value={p.fax} onChange={onChange} placeholder="02165-XXXXXX" /></Field>
        <Field label="Toll Free"><Input name="tollfree" value={p.tollfree} onChange={onChange} placeholder="1800-XXX-XXXX" /></Field>
      </Section>
    </>
  );

  /* ── HHM ─────────────────────────────────── */
  const renderHHMProfile = () => (
    <>
      <Section icon={Icon.User} title="Manager Details">
        <Field label="Full Name" half={false}><Input name="name" value={p.name} onChange={onChange} /></Field>
        <Field label="Email" hint="(Read Only)"><Input name="email" type="email" value={p.email} readOnly /></Field>
        <Field label="Phone"><Input name="phone" type="tel" value={p.phone} onChange={onChange} /></Field>
        <Field label="Primary Location" half={false}><Input name="location" value={p.location} onChange={onChange} placeholder="e.g., Sangli, Maharashtra" /></Field>
        <Field label="Village / Taluka"><Input name="village" value={p.village} onChange={onChange} placeholder="e.g., Sangli" /></Field>
        <Field label="Region"><Input name="region" value={p.region} onChange={onChange} placeholder="e.g., Western Maharashtra" /></Field>
        <Field label="District"><Input name="district" value={p.district} onChange={onChange} placeholder="e.g., Sangli District" /></Field>
      </Section>

      <Section icon={Icon.Briefcase} title="Management Expertise">
        <Field label="Management Experience"><Input name="managementExperience" value={p.managementExperience} onChange={onChange} placeholder="e.g., 8 years" /></Field>
        <Field label="Team Size"><Input name="teamSize" value={p.teamSize} onChange={onChange} placeholder="e.g., 15–20 labours" /></Field>
        <Field label="Avg Completion Time"><Input name="avgCompletionTime" value={p.avgCompletionTime} onChange={onChange} placeholder="e.g., 45 days/season" /></Field>
        <Field label="Seasons Completed"><Input name="seasonsCompleted" type="number" value={p.seasonsCompleted || 0} onChange={onChange} min="0" /></Field>
        <Field label="Active Jobs"><Input name="activeJobs" type="number" value={p.activeJobs || 0} onChange={onChange} min="0" /></Field>
        <Field label="Completed Jobs"><Input name="completedJobs" type="number" value={p.completedJobs || 0} onChange={onChange} min="0" /></Field>
        <Field label="Rating (0–5)"><Input name="rating" type="number" value={p.rating || 0} onChange={onChange} min="0" max="5" /></Field>
        <Field label="Reliability Rating (0–10)"><Input name="reliabilityRating" type="number" value={p.reliabilityRating || 0} onChange={onChange} min="0" max="10" /></Field>
        <Field label="Management Operations (Comma separated)" half={false}><Input name="managementOperations" value={p.managementOperations} onChange={onChange} placeholder="e.g., Cutting, Loading, Transport" /></Field>
        <Field label="Services Offered (Comma separated)" half={false}><Input name="servicesOffered" value={p.servicesOffered} onChange={onChange} placeholder="e.g., Full Harvest Management, Labour Supply" /></Field>
        <Field label="Working Areas (Comma separated)"><Input name="workingAreas" value={p.workingAreas} onChange={onChange} placeholder="e.g., Sangli, Kolhapur" /></Field>
        <Field label="Worker Types (Comma separated)"><Input name="workerTypes" value={p.workerTypes} onChange={onChange} placeholder="e.g., Male, Female, Mixed" /></Field>
      </Section>

      <Section icon={Icon.Payment} title="Pricing">
        <Field label="Price Range"><Input name="priceRange" value={p.priceRange} onChange={onChange} placeholder="e.g., ₹500–₹800 / day" /></Field>
        <CheckField name="isNegotiable" checked={p.isNegotiable} onChange={onChange} label="Rates Negotiable" />
      </Section>
    </>
  );

  /* ── LABOUR ──────────────────────────────── */
  const renderLabourProfile = () => (
    <>
      <Section icon={Icon.User} title="Personal Details">
        <Field label="Full Name" half={false}><Input name="name" value={p.name} onChange={onChange} /></Field>
        <Field label="Phone Number"><Input name="phone" type="tel" value={p.phone} onChange={onChange} /></Field>
        <Field label="Email" hint="(Read Only)"><Input name="email" type="email" value={p.email} readOnly /></Field>
        <Field label="Current Location" half={false}><Input name="location" value={p.location} onChange={onChange} placeholder="e.g., Solapur, Maharashtra" /></Field>
        <Field label="Preferred Work Location" half={false}><Input name="preferredLocation" value={p.preferredLocation} onChange={onChange} placeholder="e.g., Western Maharashtra" /></Field>
      </Section>

      <Section icon={Icon.Wrench} title="Work Capabilities">
        <Field label="Skills (Comma separated)" half={false}><Input name="skills" value={p.skills} onChange={onChange} placeholder="e.g., Harvesting, Tractor Operation, Loading" /></Field>
        <Field label="Work Experience"><Input name="workExperience" value={p.workExperience} onChange={onChange} placeholder="e.g., 5 years in sugarcane" /></Field>
        <Field label="Daily Wage Rate (₹)"><Input name="wageRate" value={p.wageRate} onChange={onChange} placeholder="e.g., ₹550" /></Field>
        <Field label="Availability">
          <Select name="availability" value={p.availability || 'Available'} onChange={onChange} options={[
            ['Available', 'Available'], ['Unavailable', 'Unavailable']
          ]} />
        </Field>
        <Field label="Work Preferences" half={false}><Input name="workPreferences" value={p.workPreferences} onChange={onChange} placeholder="e.g., Day shift, No overnight, Specific districts" /></Field>
      </Section>
    </>
  );

  /* ── RENDER ──────────────────────────────── */
  return (
    <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
      <div className="fp-noise" />
      <div className="fp-bg-glow" />

      <div className="fp-layout-shell">
        <aside className="fp-sidebar">
          <div className="fp-sidebar-profile">
            <div className="fp-avatar-wrap">
              <div className="fp-avatar">{initials}</div>
              <div className="fp-avatar-ring" />
            </div>
            <div className="fp-user-name">{p.name || 'My Profile'}</div>
            <div className="fp-user-role">
              <span className="fp-role-dot" style={{ background: hasChanges ? '#ff9800' : '#4caf50' }} />
              {userRole} Account
            </div>
          </div>
        </aside>

        <main className="fp-main">
          <div className="fp-page-header">
            <div className="fp-header-left">
              <div className="fp-eyebrow">Settings</div>
              <h1 className="fp-title">My <em className="fp-highlight">Profile</em></h1>
              <p className="fp-subtitle">Update your personal and operations data</p>
            </div>
            <div className="fp-header-right">
              <button className={`fp-btn-save-top ${saving ? 'pulse' : ''}`} onClick={handleSubmit}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', color: '#ff6b6b', padding: '1rem', borderRadius: 8, marginBottom: '2rem' }}>
              ⚠️ {error}
            </div>
          )}
          {successMessage && (
            <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50', color: 'var(--green)', padding: '1rem', borderRadius: 8, marginBottom: '2rem' }}>
              ✅ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {userRole === 'Farmer'  && renderFarmerProfile()}
            {userRole === 'Factory' && renderFactoryProfile()}
            {userRole === 'HHM'     && renderHHMProfile()}
            {userRole === 'Labour'  && renderLabourProfile()}
          </form>
        </main>
      </div>

      {/* STICKY SAVE BAR */}
      <div className={`pp-sticky-save ${hasChanges ? 'visible' : ''}`}>
        <div className="pp-sticky-inner">
          <div className="pp-sticky-msg">
            <span className="pp-pulse-dot" />
            <strong>Unsaved changes</strong> — save to update your profile
          </div>
          <div className="pp-sticky-btns">
            <button type="button" className="pp-btn-discard" onClick={() => { setProfileData(savedSnapshot); setHasChanges(false); }}>
              Discard
            </button>
            <button type="button" className="pp-btn-save" disabled={saving} onClick={handleSubmit}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
