import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css';

const Ic = ({ d, s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const IC = {
  back:    'M19 12H5 M12 5l-7 7 7 7',
  loc:     ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z','M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  crop:    'M12 22V12 M12 12C12 12 7 9 7 4a5 5 0 0 1 10 0c0 5-5 8-5 8z M4 22h16',
  workers: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
  truck:   ['M1 3h15v13H1z','M16 8h4l3 3v5h-7V8z','M5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z','M18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'],
  cal:     ['M3 4h18v18H3V4z','M16 2v4','M8 2v4','M3 10h18'],
  money:   'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  star:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  phone:   'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z',
  mail:    ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z','M22 6l-10 7L2 6'],
  send:    'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  farm:    ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z','M9 22V12h6v10'],
  shield:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
};

const g = (col) => `radial-gradient(ellipse, ${col}18, transparent 70%)`;

const Card = ({ icon, title, sub, children }) => (
  <section style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden', marginBottom: '18px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(126,200,67,0.1)', border: '1px solid rgba(126,200,67,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0 }}>
        <Ic d={IC[icon]} s={14} />
      </div>
      <div>
        <div style={{ fontWeight: '700', color: '#e8e8e8', fontSize: '0.9rem' }}>{title}</div>
        {sub && <div style={{ color: '#4a4a4a', fontSize: '0.75rem' }}>{sub}</div>}
      </div>
    </div>
    <div style={{ padding: '18px 20px' }}>{children}</div>
  </section>
);

const Row = ({ label, val, hi }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span style={{ color: '#4a4a4a', fontSize: '0.77rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
    <span style={{ color: hi ? 'var(--green)' : '#bbb', fontSize: '0.86rem', fontWeight: hi ? '700' : '400', maxWidth: '55%', textAlign: 'right' }}>{val || '—'}</span>
  </div>
);

const Met = ({ icon, val, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 10px', background: 'rgba(126,200,67,0.05)', borderRadius: '12px', border: '1px solid rgba(126,200,67,0.1)', gap: '7px' }}>
    <div style={{ color: 'var(--green)' }}><Ic d={IC[icon]} s={17} /></div>
    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff' }}>{val || '—'}</div>
    <div style={{ fontSize: '0.68rem', color: '#4a4a4a', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>{label}</div>
  </div>
);

const Bdg = ({ text, color = 'var(--green)' }) => (
  <span style={{ padding: '3px 9px', borderRadius: '20px', background: `${color}20`, border: `1px solid ${color}40`, color, fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{text}</span>
);

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.backgroundColor = '#0b0f0b';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const r = await axios.get(`/api/users/profile/${userId}`);
        if (r.data.success) setUser(r.data.data);
        else throw new Error(r.data.message);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load profile');
      } finally { setLoading(false); }
    };
    if (userId) fetch();
  }, [userId]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b', color: 'var(--green)' }}>Loading harvest profile...</div>;
  if (error || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b', gap: '16px' }}>
      <div style={{ color: '#ff6b6b' }}>{error || 'Profile not found'}</div>
      <button onClick={() => navigate(-1)} className="fp-save-btn">Go Back</button>
    </div>
  );

  const isFarmer = user.role === 'Farmer' || user.role === 'farmer' || !user.role;
  const initials = (user.name || 'F').slice(0, 2).toUpperCase();
  const isActive = user.isActive !== false;

  // Operational data — real fields first, smart fallbacks
  const farmSize   = user.farmSize   ? `${user.farmSize} Acres` : null;
  const cropVar    = user.cropVariety || user.caneVariety || null;
  const estYield   = user.estimatedYield || (user.farmSize ? `${Math.round(Number(String(user.farmSize).replace(/\D/g,'')) * 25)} Tons` : null);
  const harvestDt  = user.preferredHarvestDate || user.harvestDate || null;
  const cropStatus = user.cropStatus || (isActive ? 'Standing Crop' : 'Off Season');
  const workers    = user.workersNeeded || user.labourRequired || null;
  const hType      = user.harvestType || 'Manual';
  const dist       = user.distanceFromFactory ? `${user.distanceFromFactory} km` : null;
  const village    = user.village || user.location || null;
  const roadAccess = user.roadAccessibility || 'Truck Accessible';

  const df = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

  return (
    <div style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.06) 0%, transparent 50%), #0b0f0b', minHeight: '100vh' }}>
      <div className="fp-noise" />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 28px 100px' }}>

        {/* BACK */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '7px 14px', color: '#666', cursor: 'pointer', fontSize: '0.8rem', marginBottom: '28px' }}>
          <Ic d={IC.back} s={13} /> Back to Directory
        </button>

        {/* HERO */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '28px', padding: '24px 28px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '280px', height: '100%', background: g('rgba(126,200,67,0.08)'), pointerEvents: 'none' }} />
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(126,200,67,0.1)', border: '2px solid rgba(126,200,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '900', color: 'var(--green)', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '5px' }}>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>{user.name || 'Unknown'}</h1>
              <Bdg text={isActive ? 'Active Season' : 'Inactive'} color={isActive ? 'var(--green)' : '#e74c3c'} />
              {isFarmer && <Bdg text="Harvest Ready" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#555', fontSize: '0.8rem', marginBottom: '10px' }}>
              <Ic d={IC.loc} s={12} /> {village || 'Location not specified'}{user.region ? ` • ${user.region}` : ''}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {user.email && <a href={`mailto:${user.email}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#888', fontSize: '0.78rem', textDecoration: 'none' }}><Ic d={IC.mail} s={11} />{user.email}</a>}
              {user.phone && <a href={`tel:${user.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#888', fontSize: '0.78rem', textDecoration: 'none' }}><Ic d={IC.phone} s={11} />{user.phone}</a>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
            {user.email && (
              <a href={`mailto:${user.email}`} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#5cb83a,#7ec843)', color: '#0b0f0b', fontSize: '0.83rem', fontWeight: '800', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 14px rgba(126,200,67,0.25)', whiteSpace: 'nowrap' }}>
                <Ic d={IC.send} s={13} /> Send Harvest Proposal
              </a>
            )}
            {user.phone && (
              <a href={`tel:${user.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '9px', background: 'transparent', border: '1px solid rgba(126,200,67,0.28)', color: 'var(--green)', fontSize: '0.83rem', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                <Ic d={IC.phone} s={13} /> Contact Farmer
              </a>
            )}
          </div>
        </div>

        {/* QUICK METRICS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
          <Met icon="farm"    val={farmSize}                          label="Total Area" />
          <Met icon="crop"    val={estYield}                          label="Est. Yield" />
          <Met icon="workers" val={workers}                           label="Workers Needed" />
          <Met icon="loc"     val={dist}                              label="Factory Distance" />
        </div>

        {/* 2-COL GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>

          <div>
            <Card icon="crop" title="Farm & Crop Information" sub="Crop status, variety and tonnage estimates">
              <Row label="Total Cane Area"       val={farmSize}                                hi />
              <Row label="Cane Variety"          val={cropVar} />
              <Row label="Crop Status"           val={cropStatus}                             hi />
              <Row label="Estimated Yield"       val={estYield}                               hi />
              <Row label="Preferred Harvest"     val={df(harvestDt)} />
              <Row label="Farm Type"             val={user.farmType} />
              <Row label="Experience"            val={user.experience ? `${user.experience} Yrs` : null} />
            </Card>

            <Card icon="loc" title="Location & Logistics" sub="Field access, road conditions and distance">
              <Row label="Village / Taluka"      val={village} />
              <Row label="District"              val={user.district || user.region} />
              <Row label="Factory Distance"      val={dist}                                   hi />
              <Row label="Road Accessibility"    val={roadAccess} />
              <Row label="Nearby Loading Point"  val={user.loadingPoint} />
              <Row label="Transport Access"      val={user.transportRequired !== false ? 'Truck Accessible' : 'Limited'} hi />
            </Card>

            <Card icon="money" title="Payment & Contract" sub="Settlement preferences and contract type">
              <Row label="Contract Status"       val={user.contractStatus || 'Open for Proposals'} hi />
              <Row label="Payment Method"        val={user.preferredPayment || 'Bank Transfer'} />
              <Row label="Previous Contract"     val={user.previousContractType || 'Seasonal'} />
              <Row label="Advance Required"      val={user.advanceRequired ? 'Yes' : 'Negotiable'} />
              <Row label="Settlement"            val={user.settlementPreference || 'Per Harvest Cycle'} />
            </Card>
          </div>

          <div>
            <Card icon="workers" title="Harvest Requirements" sub="Labour, equipment and operational needs">
              <Row label="Workers Required"      val={workers}                                hi />
              <Row label="Harvest Type"          val={hType} />
              <Row label="Transport Required"    val={user.transportRequired !== false ? 'Yes — Truck Access' : 'Self-Arranged'} />
              <Row label="Loading Support"       val={user.loadingSupport ? 'Yes' : 'Not Specified'} />
              <Row label="Machine Requirement"   val={user.machineRequired || 'Manual Preferred'} />
              <Row label="Urgency Level"         val={user.urgencyLevel || 'Normal Season'} />
            </Card>

            <Card icon="cal" title="Harvest Schedule" sub="Operational timeline and shift preferences">
              <Row label="Harvest Window"        val={df(harvestDt)} />
              <Row label="Urgency"               val={user.urgencyLevel || 'Standard Season'} />
              <Row label="Daily Working Hours"   val={user.dailyHours ? `${user.dailyHours} hrs` : null} />
              <Row label="Preferred Shift"       val={user.shiftPreference || 'Day Shift'} />
              <Row label="Availability"          val={user.availability || 'Active Season'}  hi />
            </Card>

            <Card icon="star" title="Previous HHM Coordination" sub="Track record and operational history">
              <Row label="HHM Partnerships"      val={user.hhmPartnerships}                  hi />
              <Row label="Seasons Completed"     val={user.seasonsCompleted}                 hi />
              <Row label="Reliability Rating"    val={user.reliabilityRating ? `${user.reliabilityRating}/10` : null} />
              <Row label="Track Record"          val={user.trackRecord || 'Not Evaluated'} />
              <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(126,200,67,0.05)', borderRadius: '9px', border: '1px solid rgba(126,200,67,0.1)', color: user.seasonsCompleted ? 'var(--green)' : '#444', fontSize: '0.78rem' }}>
                {user.seasonsCompleted ? `${user.seasonsCompleted} seasons of verified harvest operations` : 'No prior HHM coordination recorded'}
              </div>
            </Card>
          </div>

        </div>

        {/* CONTACT + NOTES full-width */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '0' }}>
          <Card icon="phone" title="Contact Information" sub="Direct coordination channels">
            {user.email && <Row label="Email"   val={user.email} />}
            {user.phone && <Row label="Phone"   val={user.phone} />}
            <Row label="Preferred Contact"      val={user.contactPreference || 'Any'} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {user.email && <a href={`mailto:${user.email}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', background: 'linear-gradient(135deg,#5cb83a,#7ec843)', color: '#0b0f0b', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}><Ic d={IC.mail} s={12} />Email</a>}
              {user.phone && <a href={`tel:${user.phone}`}   style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(126,200,67,0.28)', color: 'var(--green)', fontSize: '0.8rem', textDecoration: 'none' }}><Ic d={IC.phone} s={12} />Call</a>}
            </div>
          </Card>

          <Card icon="shield" title="Operational Notes" sub="Additional information and member details">
            <Row label="Member Since"   val={df(user.createdAt)} />
            <Row label="Last Updated"   val={df(user.updatedAt)} />
            {user.description && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.06)', color: '#666', fontSize: '0.82rem', lineHeight: '1.6' }}>{user.description}</div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
