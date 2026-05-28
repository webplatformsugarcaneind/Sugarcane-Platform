import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FarmerDashboardPage.css';

const Icons = {
  Envelope: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>),
  Clipboard: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .415.162.798.425 1.082.263.285.622.46 1.024.46a1.5 1.5 0 001.025-.46 1.518 1.518 0 00.425-1.082c0-.231-.035-.454-.1-.664m-5.8 0A48.108 48.108 0 003.412 4.22c-1.13.094-1.976 1.057-1.976 2.192V16.5A2.25 2.25 0 003.75 18.75h.007m10.5-11.25h.008v.008h-.008V7.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>),
  Map: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-1.5V21m3.75-18v15m-13.5 0v-15m13.5 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 5.25v13.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V5.25z" /></svg>),
  Clock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  ArrowLeft: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>)
};

const InvitationDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { item, activeTab } = location.state || {};

  if (!item) {
    return (
      <div className="fr-page">
        <div className="fr-empty">
          <p>No details found. Please go back.</p>
          <button onClick={() => navigate(-1)} className="fr-clear-btn" style={{ marginTop: '16px' }}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fr-page">
      <div className="fr-ambient-glow fr-ambient-left"></div>
      <div className="fr-ambient-glow fr-ambient-right"></div>
      
      <div className="fr-content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '1rem' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--white)'} 
          onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          <Icons.ArrowLeft style={{ width: '20px' }} /> Back to Applications
        </button>

        <div className="fr-contract-card" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0 }}>
               {activeTab === 'invitations' ? <Icons.Envelope style={{ width: '32px' }} /> : <Icons.Clipboard style={{ width: '32px' }} />}
            </div>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--white)' }}>{item.job.title}</h2>
              <div style={{ fontSize: '1.05rem', color: 'var(--muted)' }}>
                By <strong style={{ color: 'var(--white)' }}>{item.employer.name}</strong> <span style={{ color: 'var(--amber)' }}><svg viewBox="0 0 24 24" fill="#f59e0b" width="13" height="13" style={{verticalAlign:'middle',marginRight:2}}><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"/></svg> {item.employer.rating}</span>

              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Location</div>
              <div style={{ color: 'var(--white)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Map style={{ width: '18px' }} /> {item.job.location}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Wage Offered</div>
              <div style={{ color: 'var(--green)', fontWeight: 'bold', fontSize: '1.05rem' }}>₹{item.job.wageOffered}/day</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Date</div>
              <div style={{ color: 'var(--white)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Clock style={{ width: '18px' }} /> {new Date(activeTab === 'invitations' ? item.invitedAt : item.appliedAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Status</div>
              <span className={`fr-badge ${item.status === 'pending' ? 'pending' : (item.status === 'approved' || item.status === 'accepted') ? 'accepted' : 'rejected'}`} style={{ padding: '6px 16px', fontSize: '0.85rem', display: 'inline-block' }}>
                {item.status}
              </span>
            </div>
          </div>

          <div style={{ padding: '24px', background: 'rgba(126,200,67,0.05)', borderRadius: '16px', border: '1px solid rgba(126,200,67,0.1)', marginBottom: item.response ? '20px' : '0' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '16px' }}>
              {activeTab === 'invitations' ? 'Invitation Message' : 'Your Pitch'}
            </div>
            <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--white)', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{item.message}"
            </p>
          </div>

          {item.response && (
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '16px' }}>
                Employer Response
              </div>
              <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--white)', lineHeight: 1.7 }}>
                {item.response}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationDetailsPage;
