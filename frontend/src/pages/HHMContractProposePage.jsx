import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css';

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  contract: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  workers: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  truck: 'M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  calendar: 'M3 4h18v18H3V4z M16 2v4 M8 2v4 M3 10h18',
  money: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  support: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  check: 'M20 6L9 17l-5-5',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  factory: 'M2 20h20 M5 20V8l7-5 7 5v12 M9 20v-5h6v5',
};

const SCard = ({ icon, title, sub, children }) => (
  <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(126,200,67,0.12)', border: '1px solid rgba(126,200,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0 }}>
        <Icon d={ICONS[icon]} size={17} />
      </div>
      <div>
        <div style={{ fontWeight: '700', color: 'var(--white)', fontSize: '0.97rem' }}>{title}</div>
        <div style={{ color: '#555', fontSize: '0.8rem', marginTop: '2px' }}>{sub}</div>
      </div>
    </div>
    <div style={{ padding: '24px' }}>{children}</div>
  </section>
);

const FGrid = ({ cols = 2, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px' }}>{children}</div>
);

const FField = ({ label, span, children, error }) => (
  <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
    <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    {children}
    {error && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px' }}>{error}</div>}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.025)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
    <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{label}</span>
    <div onClick={onChange} style={{ width: '40px', height: '22px', borderRadius: '11px', background: checked ? 'var(--green)' : '#2a2a2a', position: 'relative', transition: 'background 0.2s', flexShrink: 0, cursor: 'pointer' }}>
      <div style={{ position: 'absolute', top: '3px', left: checked ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </div>
  </label>
);

const HHMContractProposePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState(null);

  const [form, setForm] = useState({
    title: '', contractType: 'Seasonal Harvest', harvestSeason: '', region: '', allocationTyp: '',
    totalWorkers: '', harvestGangs: '', supervisors: '', skilledPct: '', dailyShift: '', experienceLevel: 'Intermediate',
    tractors: '', trucks: '', loadingEquip: false, fuelResp: 'HHM', maintenanceResp: 'HHM', nightTransport: false,
    availableFrom: '', durationDays: '', dailyHours: '10', shiftType: 'Day Shift', peakCapacity: '', intakeWindow: '',
    paymentType: 'Per Ton', expectedRate: '', advanceRequired: false, settlementCycle: '14 Days', delayPenalty: false, paymentMethod: 'Bank Transfer',
    accommodation: false, foodSupport: false, factoryTransport: false, yardAccess: false, medicalSupport: false, nightShiftSupport: false,
    minGuarantee: '', overtimePolicy: 'Standard', emergencyAvail: false, replacementPolicy: '', cancellationTerms: '',
    workedBefore: false, seasonsCompleted: '', prevRating: '', reliabilityScore: '',
    message: ''
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const inp = (name) => ({ name, value: form[name], onChange: e => set(name, e.target.value) });
  const sel = (name, opts) => (
    <select {...inp(name)} style={iStyle}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const iStyle = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--white)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

  useEffect(() => {
    axios.get(`/api/public/factories/${id}`)
      .then(r => setFactory(r.data.data?.factory || r.data.factory || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.contractType) e.contractType = 'Required';
    if (!form.totalWorkers) e.totalWorkers = 'Required';
    if (!form.availableFrom) e.availableFrom = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (draft = false) => {
    if (!draft && !validate()) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/hhm/contract-requests', {
        factory_id: id,
        title: form.title || `Harvesting Contract — ${factory?.name}`,
        status: draft ? 'draft' : 'pending',
        ...form
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(draft ? '📁 Draft saved!' : '✅ Contract proposal sent!');
      navigate(`/hhm/factories/${id}`);
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Failed'}`);
    } finally { setSubmitting(false); }
  };

  const tiles = (name, opts) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {opts.map(o => (
        <div key={o} onClick={() => set(name, o)} style={{ padding: '8px 16px', borderRadius: '8px', background: form[name] === o ? 'rgba(126,200,67,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form[name] === o ? 'rgba(126,200,67,0.5)' : 'rgba(255,255,255,0.08)'}`, color: form[name] === o ? 'var(--green)' : '#888', fontSize: '0.83rem', cursor: 'pointer', transition: 'all 0.15s', fontWeight: form[name] === o ? '600' : '400' }}>{o}</div>
      ))}
    </div>
  );

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b', color: 'var(--green)' }}>Loading...</div>;

  const NAV = '64px';
  const SW = '25%';

  return (
    <div style={{ background: '#0b0f0b', display: 'flex', alignItems: 'flex-start', position: 'relative' }}>

      {/* STICKY SIDEBAR */}
      <div style={{ width: SW, flexShrink: 0, position: 'sticky', top: NAV, height: `calc(100vh - ${NAV})`, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px 28px', overflowY: 'hidden', zIndex: 10, background: 'radial-gradient(ellipse at 0% 0%, rgba(126,200,67,0.05) 0%, transparent 60%), #0b0f0b', alignSelf: 'flex-start' }}>
        <div style={{ color: 'var(--green)', letterSpacing: '2px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>Factory Partnership</div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: '900', margin: 0, color: 'var(--white)', lineHeight: 1.2 }}>
          <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Contract</em>
        </h1>

        {factory && (
          <div style={{ padding: '16px', background: 'rgba(126,200,67,0.07)', borderRadius: '12px', border: '1px solid rgba(126,200,67,0.2)' }}>
            <div style={{ color: '#555', fontSize: '0.68rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Target Factory</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Icon d={ICONS.factory} size={14} />
              <span style={{ fontWeight: '800', color: 'var(--white)', fontSize: '0.97rem' }}>{factory.name}</span>
            </div>
            {factory.location && <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '4px' }}>📍 {factory.location}</div>}
            {factory.capacity && <div style={{ color: 'var(--green)', fontSize: '0.8rem', fontWeight: '600' }}>{factory.capacity} TCD Capacity</div>}
          </div>
        )}

        <p style={{ fontSize: '0.83rem', color: '#555', lineHeight: '1.65', margin: 0 }}>
          Submit a formal harvesting operations contract proposal to this factory for the upcoming crushing season.
        </p>

        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.025)', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
          <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon d={ICONS.shield} size={13} /> Proposal Tips
          </div>
          <ul style={{ color: '#555', fontSize: '0.8rem', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
            <li>— Be specific about gang capacity</li>
            <li>— State your daily tonnage capacity</li>
            <li>— Set a realistic contract duration</li>
          </ul>
        </div>
      </div>

      {/* FORM PANEL */}
      <div style={{ flex: 1, padding: '40px 52px 80px', background: 'radial-gradient(ellipse at 80% 0%, rgba(126,200,67,0.03) 0%, transparent 50%), #0b0f0b' }}>
        <div style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* S1: CONTRACT IDENTITY */}
          <SCard icon="contract" title="Contract Identity" sub="Season, type, and operational scope">
            <FGrid cols={2}>
              <FField label="Contract Title" span={2}>
                <input type="text" {...inp('title')} placeholder="e.g. Kharif 2025 Harvest Operations" style={iStyle} />
              </FField>
              <FField label="Contract Type" error={errors.contractType}>
                {sel('contractType', ['Seasonal Harvest', 'Labour Supply', 'Transport Support', 'Harvest + Transport', 'Emergency Operations'])}
              </FField>
              <FField label="Harvest Season">
                <input type="text" {...inp('harvestSeason')} placeholder="e.g. Kharif 2025" style={iStyle} />
              </FField>
              <FField label="Operational Region / Zone" span={2}>
                <input type="text" {...inp('region')} placeholder="e.g. Sangli District, Zone B" style={iStyle} />
              </FField>
              <FField label="Factory Allocation Type" span={2}>
                {tiles('allocationTyp', ['Primary Contractor', 'Secondary Support', 'Emergency Backup', 'Seasonal Associate'])}
              </FField>
            </FGrid>
          </SCard>

          {/* S2: WORKFORCE */}
          <SCard icon="workers" title="Workforce Capacity" sub="Labour gangs, supervisors and shift strength">
            <FGrid cols={3}>
              <FField label="Total Workers" error={errors.totalWorkers}>
                <input type="number" {...inp('totalWorkers')} placeholder="68" style={iStyle} />
              </FField>
              <FField label="Harvest Gangs">
                <input type="number" {...inp('harvestGangs')} placeholder="4" style={iStyle} />
              </FField>
              <FField label="Supervisors">
                <input type="number" {...inp('supervisors')} placeholder="6" style={iStyle} />
              </FField>
              <FField label="Skilled Worker %">
                <input type="number" {...inp('skilledPct')} placeholder="70" min="0" max="100" style={iStyle} />
              </FField>
              <FField label="Daily Shift Capacity (Tons)">
                <input type="number" {...inp('dailyShift')} placeholder="220" style={iStyle} />
              </FField>
              <FField label="Experience Level">
                {sel('experienceLevel', ['Beginner', 'Intermediate', 'Experienced', 'Expert'])}
              </FField>
            </FGrid>
          </SCard>

          {/* S3: VEHICLES */}
          <SCard icon="truck" title="Vehicle & Equipment" sub="Transport fleet and operational equipment">
            <FGrid cols={3}>
              <FField label="Tractor Count">
                <input type="number" {...inp('tractors')} placeholder="5" style={iStyle} />
              </FField>
              <FField label="Truck Count">
                <input type="number" {...inp('trucks')} placeholder="3" style={iStyle} />
              </FField>
              <FField label="Fuel Responsibility">
                {sel('fuelResp', ['HHM', 'Factory', 'Shared'])}
              </FField>
              <FField label="Maintenance Responsibility">
                {sel('maintenanceResp', ['HHM', 'Factory', 'Shared'])}
              </FField>
              <FField label="Loading Equipment" span={2}>
                {tiles('loadingEquip', [true, false].map(v => v ? 'Available' : 'Not Available'))}
              </FField>
            </FGrid>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
              <Toggle label="Night Transport Available" checked={form.nightTransport} onChange={() => set('nightTransport', !form.nightTransport)} />
            </div>
          </SCard>

          {/* S4: SCHEDULE */}
          <SCard icon="calendar" title="Harvest Operations Schedule" sub="Availability, shifts and tonnage targets">
            <FGrid cols={2}>
              <FField label="Available From" error={errors.availableFrom}>
                <input type="date" {...inp('availableFrom')} style={{ ...iStyle, colorScheme: 'dark' }} />
              </FField>
              <FField label="Contract Duration (Days)">
                <input type="number" {...inp('durationDays')} placeholder="90" style={iStyle} />
              </FField>
              <FField label="Daily Working Hours">
                {sel('dailyHours', ['8', '10', '12', '14', '16'])}
              </FField>
              <FField label="Shift Type">
                {tiles('shiftType', ['Day Shift', 'Night Shift', 'Full-Time Operations'])}
              </FField>
              <FField label="Peak Daily Capacity (Tons)">
                <input type="number" {...inp('peakCapacity')} placeholder="280" style={iStyle} />
              </FField>
              <FField label="Preferred Intake Window">
                <input type="text" {...inp('intakeWindow')} placeholder="e.g. 6 AM – 10 AM" style={iStyle} />
              </FField>
            </FGrid>
          </SCard>

          {/* S5: PAYMENT */}
          <SCard icon="money" title="Payment Terms" sub="Rate, settlement cycle and advance requirements">
            <FGrid cols={2}>
              <FField label="Payment Type" span={2}>
                {tiles('paymentType', ['Per Ton', 'Per Worker Per Day', 'Fixed Seasonal Contract'])}
              </FField>
              <FField label="Expected Rate (₹)">
                <input type="number" {...inp('expectedRate')} placeholder="e.g. 350 per ton" style={iStyle} />
              </FField>
              <FField label="Settlement Cycle">
                {sel('settlementCycle', ['Weekly', '14 Days', 'Monthly', 'End of Season'])}
              </FField>
              <FField label="Payment Method">
                {sel('paymentMethod', ['Bank Transfer', 'Cheque', 'Cash', 'UPI'])}
              </FField>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Toggle label="Advance Payment Required" checked={form.advanceRequired} onChange={() => set('advanceRequired', !form.advanceRequired)} />
                <Toggle label="Delay Penalty Agreement" checked={form.delayPenalty} onChange={() => set('delayPenalty', !form.delayPenalty)} />
              </div>
            </FGrid>
          </SCard>

          {/* S6: OPERATIONAL SUPPORT */}
          <SCard icon="support" title="Operational Support" sub="On-site requirements from the factory">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Toggle label="Accommodation Required" checked={form.accommodation} onChange={() => set('accommodation', !form.accommodation)} />
              <Toggle label="Food Support Needed" checked={form.foodSupport} onChange={() => set('foodSupport', !form.foodSupport)} />
              <Toggle label="Factory Transport Support" checked={form.factoryTransport} onChange={() => set('factoryTransport', !form.factoryTransport)} />
              <Toggle label="Nearby Yard Access" checked={form.yardAccess} onChange={() => set('yardAccess', !form.yardAccess)} />
              <Toggle label="Emergency Medical Support" checked={form.medicalSupport} onChange={() => set('medicalSupport', !form.medicalSupport)} />
              <Toggle label="Night Shift Support" checked={form.nightShiftSupport} onChange={() => set('nightShiftSupport', !form.nightShiftSupport)} />
            </div>
          </SCard>

          {/* S7: CONDITIONS */}
          <SCard icon="shield" title="Contract Conditions" sub="Operational guarantees and policies">
            <FGrid cols={2}>
              <FField label="Minimum Work Guarantee (Days)">
                <input type="number" {...inp('minGuarantee')} placeholder="30" style={iStyle} />
              </FField>
              <FField label="Overtime Policy">
                {sel('overtimePolicy', ['Standard Rate', '1.5x Rate', 'Double Rate', 'No Overtime'])}
              </FField>
              <FField label="Replacement Worker Policy" span={2}>
                <input type="text" {...inp('replacementPolicy')} placeholder="e.g. Replacement within 24 hours if worker absent" style={iStyle} />
              </FField>
              <FField label="Cancellation Terms" span={2}>
                <input type="text" {...inp('cancellationTerms')} placeholder="e.g. 7-day notice required" style={iStyle} />
              </FField>
              <div style={{ gridColumn: 'span 2' }}>
                <Toggle label="Emergency Availability (24/7 response)" checked={form.emergencyAvail} onChange={() => set('emergencyAvail', !form.emergencyAvail)} />
              </div>
            </FGrid>
          </SCard>

          {/* S8: PREVIOUS PARTNERSHIP */}
          <SCard icon="star" title="Previous Partnership" sub="Track record and operational history">
            <FGrid cols={2}>
              <div style={{ gridColumn: 'span 2' }}>
                <Toggle label="Worked With This Factory Before" checked={form.workedBefore} onChange={() => set('workedBefore', !form.workedBefore)} />
              </div>
              {form.workedBefore && <>
                <FField label="Seasons Completed">
                  <input type="number" {...inp('seasonsCompleted')} placeholder="3" style={iStyle} />
                </FField>
                <FField label="Previous Performance Rating (1-10)">
                  <input type="number" {...inp('prevRating')} placeholder="8.5" min="1" max="10" step="0.1" style={iStyle} />
                </FField>
                <FField label="Operational Reliability Score" span={2}>
                  {tiles('reliabilityScore', ['Excellent', 'Very Good', 'Good', 'Average'])}
                </FField>
              </>}
            </FGrid>
          </SCard>

          {/* S9: MESSAGE */}
          <SCard icon="message" title="Additional Notes" sub="Any specific requirements or operational notes">
            <FField label="">
              <textarea {...inp('message')} placeholder="Describe any specific operational requirements, past experience highlights, or conditions for this season..." rows="4" style={{ ...iStyle, resize: 'vertical' }} />
            </FField>
          </SCard>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button type="button" onClick={() => navigate(`/hhm/factories/${id}`)} style={{ padding: '13px 28px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#888', fontSize: '0.9rem', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="button" onClick={() => handleSubmit(true)} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#ccc', fontSize: '0.9rem', cursor: 'pointer' }}>
              <Icon d={ICONS.save} size={15} /> Save Draft
            </button>
            <button type="button" onClick={() => handleSubmit(false)} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 36px', borderRadius: '10px', background: 'linear-gradient(135deg, #5cb83a, #7ec843)', border: 'none', color: '#0b0f0b', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 20px rgba(126,200,67,0.3)' }}>
              <Icon d={ICONS.send} size={15} /> {submitting ? 'Sending...' : 'Send Contract Proposal'}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        input:focus, select:focus, textarea:focus { border-color: rgba(126,200,67,0.6) !important; box-shadow: 0 0 0 3px rgba(126,200,67,0.07) !important; }
        input::placeholder, textarea::placeholder { color: #3a3a3a; }
        select option { background: #141814; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
      `}</style>
    </div>
  );
};

export default HHMContractProposePage;
