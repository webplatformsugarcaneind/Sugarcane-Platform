import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css';

/* ── SVG Icon helper ── */
const Ic = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IC = {
  back:     'M19 12H5 M12 5l-7 7 7 7',
  farm:     ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  crop:     'M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z M12 6v6l4 2',
  workers:  ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  truck:    ['M1 3h15v13H1z', 'M16 8h4l3 3v5h-7V8z', 'M5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'],
  location: ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  calendar: ['M3 4h18v18H3V4z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  money:    'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  phone:    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z',
  mail:     ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6'],
  send:     'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  check:    'M20 6L9 17l-5-5',
  tool:     ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'],
  harvest:  'M12 22V12 M12 12C12 12 7 9 7 4a5 5 0 0 1 10 0c0 5-5 8-5 8z M4 22h16',
  clock:    ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v6l4 2'],
};

/* ── Reusable card ── */
const Card = ({ icon, title, sub, children, accent }) => (
  <section style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${accent ? 'rgba(126,200,67,0.18)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: accent ? 'rgba(126,200,67,0.04)' : 'transparent' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(126,200,67,0.1)', border: '1px solid rgba(126,200,67,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0 }}>
        <Ic d={IC[icon]} size={15} />
      </div>
      <div>
        <div style={{ fontWeight: '700', color: 'var(--white)', fontSize: '0.93rem' }}>{title}</div>
        <div style={{ color: '#555', fontSize: '0.77rem', marginTop: '1px' }}>{sub}</div>
      </div>
    </div>
    <div style={{ padding: '20px 22px' }}>{children}</div>
  </section>
);

/* ── Read-only info row ── */
const Row = ({ label, value, highlight }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
    <span style={{ color: highlight ? 'var(--green)' : '#ccc', fontSize: '0.88rem', fontWeight: highlight ? '700' : '500', textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
  </div>
);

/* ── Metric pill ── */
const Metric = ({ label, value, icon }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 12px', background: 'rgba(126,200,67,0.05)', borderRadius: '12px', border: '1px solid rgba(126,200,67,0.12)', gap: '8px' }}>
    <div style={{ color: 'var(--green)' }}><Ic d={IC[icon]} size={18} /></div>
    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--white)' }}>{value || '—'}</div>
    <div style={{ fontSize: '0.72rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>{label}</div>
  </div>
);

/* ── Badge ── */
const Badge = ({ text, color = 'var(--green)' }) => (
  <span style={{ padding: '4px 10px', borderRadius: '20px', background: `${color}18`, border: `1px solid ${color}40`, color, fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{text}</span>
);

const HHMFarmerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFarmer = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem('token');
      if (!token) { setError('Authentication required.'); return; }
      const r = await axios.get(`/api/hhm/farmer/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setFarmer(r.data.data || r.data.farmer);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load farmer profile');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { if (id) fetchFarmer(); }, [id, fetchFarmer]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b', color: 'var(--green)' }}>Loading harvest profile...</div>
  );

  if (error || !farmer) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b', gap: '16px' }}>
      <div style={{ color: '#ff6b6b' }}>{error || 'Farmer not found'}</div>
      <button onClick={() => navigate('/hhm/farmers')} className="fp-save-btn">Back to Directory</button>
    </div>
  );

  const initials = (farmer.name || 'F').substring(0, 2).toUpperCase();
  const isActive = farmer.isActive !== false;

  // Derive operational fields (use actual data if available, fallback gracefully)
  const farmSize = farmer.farmSize ? `${farmer.farmSize} Acres` : null;
  const cropVariety = farmer.cropVariety || farmer.caneVariety || null;
  const estYield = farmer.estimatedYield || (farmer.farmSize ? `${Math.round(Number(String(farmer.farmSize).replace(/\D/g,'')) * 25)} Tons` : null);
  const harvestDate = farmer.preferredHarvestDate || farmer.harvestDate || null;
  const cropStatus = farmer.cropStatus || (isActive ? 'Standing Crop' : 'Off Season');
  const workersNeeded = farmer.workersNeeded || farmer.labourRequired || null;
  const harvestType = farmer.harvestType || 'Manual';
  const transportReq = farmer.transportRequired !== false;
  const village = farmer.village || farmer.location || null;
  const distanceKm = farmer.distanceFromFactory || null;
  const roadAccess = farmer.roadAccessibility || 'Truck Accessible';
  const paymentMethod = farmer.preferredPayment || 'Bank Transfer';
  const contractStatus = farmer.contractStatus || 'Open for Proposals';
  const prevSeasons = farmer.seasonsCompleted || farmer.previousSeasons || null;
  const reliabilityRating = farmer.reliabilityRating || farmer.rating || null;
  const hhmPartnerships = farmer.hhmPartnerships || null;

  return (
    <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.04) 0%, transparent 50%), #0b0f0b', minHeight: '100vh' }}>
      <div className="fp-noise" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px 100px' }}>

        {/* ── BACK ── */}
        <button onClick={() => navigate('/hhm/farmers')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 16px', color: '#888', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '32px' }}>
          <Ic d={IC.back} size={13} /> Back to Directory
        </button>

        {/* ── HERO ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px', marginBottom: '36px', padding: '28px 32px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'radial-gradient(ellipse at right, rgba(126,200,67,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Avatar */}
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(126,200,67,0.12)', border: '2px solid rgba(126,200,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900', color: 'var(--green)', flexShrink: 0 }}>
            {initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'var(--white)' }}>{farmer.name || 'Unknown Farmer'}</h1>
              <Badge text={isActive ? 'Active Season' : 'Inactive'} color={isActive ? 'var(--green)' : '#e74c3c'} />
              <Badge text="Harvest Ready" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.82rem', marginBottom: '12px' }}>
              <Ic d={IC.location} size={12} />
              {village || 'Location not specified'} {farmer.region ? `• ${farmer.region}` : ''}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {farmer.email && (
                <a href={`mailto:${farmer.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#aaa', fontSize: '0.8rem', textDecoration: 'none', cursor: 'pointer' }}>
                  <Ic d={IC.mail} size={12} /> {farmer.email}
                </a>
              )}
              {farmer.phone && (
                <a href={`tel:${farmer.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#aaa', fontSize: '0.8rem', textDecoration: 'none' }}>
                  <Ic d={IC.phone} size={12} /> {farmer.phone}
                </a>
              )}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
            <button onClick={() => farmer?.email && (window.location.href = `mailto:${farmer.email}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '9px', background: 'linear-gradient(135deg, #5cb83a, #7ec843)', border: 'none', color: '#0b0f0b', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 16px rgba(126,200,67,0.25)' }}>
              <Ic d={IC.send} size={13} /> Send Harvest Proposal
            </button>
            {farmer?.phone && (
              <button onClick={() => window.location.href = `tel:${farmer.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '9px', background: 'transparent', border: '1px solid rgba(126,200,67,0.3)', color: 'var(--green)', fontSize: '0.85rem', cursor: 'pointer' }}>
                <Ic d={IC.phone} size={13} /> Contact Farmer
              </button>
            )}
          </div>
        </div>

        {/* ── QUICK METRICS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
          <Metric icon="farm" label="Total Area" value={farmSize} />
          <Metric icon="harvest" label="Est. Yield" value={estYield} />
          <Metric icon="workers" label="Workers Needed" value={workersNeeded} />
          <Metric icon="location" label="Factory Distance" value={distanceKm ? `${distanceKm} km` : null} />
        </div>

        {/* ── 2 COLUMN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>

          {/* Farm & Crop Info */}
          <Card icon="crop" title="Farm & Crop Information" sub="Crop status, variety and tonnage estimates" accent>
            <Row label="Total Cane Area" value={farmSize} highlight />
            <Row label="Cane Variety" value={cropVariety} />
            <Row label="Current Crop Status" value={cropStatus} highlight />
            <Row label="Estimated Yield" value={estYield} highlight />
            <Row label="Preferred Harvest Date" value={harvestDate ? new Date(harvestDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
            <Row label="Farm Type" value={farmer.farmType} />
            <Row label="Experience" value={farmer.experience ? `${farmer.experience} Years` : null} />
          </Card>

          {/* Harvest Requirements */}
          <Card icon="workers" title="Harvest Requirements" sub="Labour, equipment and operational needs">
            <Row label="Workers Required" value={workersNeeded} highlight />
            <Row label="Harvest Type" value={harvestType} />
            <Row label="Transport Required" value={transportReq ? 'Yes — Truck Access Needed' : 'Self-Arranged'} />
            <Row label="Loading Support Needed" value={farmer.loadingSupport ? 'Yes' : 'Not Specified'} />
            <Row label="Machine Requirement" value={farmer.machineRequired || 'Manual Preferred'} />
            <Row label="Urgency Level" value={farmer.urgencyLevel || 'Normal Season'} />
          </Card>

          {/* Location & Logistics */}
          <Card icon="location" title="Location & Logistics" sub="Field access, road conditions and distance">
            <Row label="Village / Taluka" value={village} />
            <Row label="District" value={farmer.district || farmer.region} />
            <Row label="Distance from Factory" value={distanceKm ? `${distanceKm} km` : null} highlight />
            <Row label="Road Accessibility" value={roadAccess} />
            <Row label="Nearby Loading Point" value={farmer.loadingPoint || 'Not Specified'} />
            <Row label="Transport Access" value={transportReq ? 'Truck Accessible' : 'Limited Access'} highlight />
          </Card>

          {/* Harvest Schedule */}
          <Card icon="calendar" title="Harvest Schedule" sub="Operational timeline and shift preferences">
            <Row label="Preferred Harvest Window" value={farmer.harvestWindow || harvestDate ? new Date(harvestDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : null} />
            <Row label="Urgency Level" value={farmer.urgencyLevel || 'Standard Season'} />
            <Row label="Daily Working Hours" value={farmer.dailyHours ? `${farmer.dailyHours} hrs` : 'Not Specified'} />
            <Row label="Preferred Shift" value={farmer.shiftPreference || 'Day Shift'} />
            <Row label="Peak Harvest Days" value={farmer.peakDays || 'Not Specified'} />
            <Row label="Availability Timeline" value={farmer.availability || 'Confirmed — Active Season'} highlight />
          </Card>

          {/* Payment & Contract */}
          <Card icon="money" title="Payment & Contract Terms" sub="Settlement preferences and contract type">
            <Row label="Contract Status" value={contractStatus} highlight />
            <Row label="Preferred Payment Method" value={paymentMethod} />
            <Row label="Previous Contract Type" value={farmer.previousContractType || 'Seasonal'} />
            <Row label="Advance Required" value={farmer.advanceRequired ? 'Yes' : 'Negotiable'} />
            <Row label="Settlement Preference" value={farmer.settlementPreference || 'Per Harvest Cycle'} />
          </Card>

          {/* Previous HHM Coordination */}
          <Card icon="star" title="Previous HHM Coordination" sub="Operational history and trust indicators">
            <Row label="HHM Partnerships" value={hhmPartnerships} highlight />
            <Row label="Seasons Completed" value={prevSeasons} highlight />
            <Row label="Reliability Rating" value={reliabilityRating ? `${reliabilityRating}/10` : null} />
            <Row label="Operational Track Record" value={farmer.trackRecord || 'Not Evaluated'} />
            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(126,200,67,0.05)', borderRadius: '10px', border: '1px solid rgba(126,200,67,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', fontSize: '0.75rem' }}>
                <Ic d={IC.check} size={12} />
                <span style={{ color: prevSeasons ? 'var(--green)' : '#555' }}>{prevSeasons ? `${prevSeasons} seasons of verified harvest operations` : 'No prior HHM coordination recorded'}</span>
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          <Card icon="tool" title="Operational Notes" sub="Additional farm information and remarks">
            <Row label="Member Since" value={farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
            <Row label="Last Updated" value={farmer.updatedAt ? new Date(farmer.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
            {farmer.description && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', color: '#777', fontSize: '0.83rem', lineHeight: '1.6' }}>
                {farmer.description}
              </div>
            )}
          </Card>

          {/* Contact */}
          <Card icon="phone" title="Contact Information" sub="Direct coordination channels">
            {farmer.email && <Row label="Email" value={farmer.email} />}
            {farmer.phone && <Row label="Phone" value={farmer.phone} />}
            <Row label="Preferred Contact" value={farmer.contactPreference || 'Any'} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              {farmer.email && (
                <a href={`mailto:${farmer.email}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg, #5cb83a, #7ec843)', border: 'none', color: '#0b0f0b', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 14px rgba(126,200,67,0.2)' }}>
                  <Ic d={IC.mail} size={13} /> Email
                </a>
              )}
              {farmer.phone && (
                <a href={`tel:${farmer.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '9px', background: 'transparent', border: '1px solid rgba(126,200,67,0.3)', color: 'var(--green)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'none' }}>
                  <Ic d={IC.phone} size={13} /> Call
                </a>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default HHMFarmerProfilePage;
