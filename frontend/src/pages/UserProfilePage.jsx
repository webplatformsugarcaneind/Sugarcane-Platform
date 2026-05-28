import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
      return (
        <div className="farmer-profile-page" style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
        }}>
          <div className="fp-spinner" style={{ borderTopColor: 'var(--green)' }}></div>
          <div style={{ color: '#f0f5ec', marginLeft: '1rem' }}>Loading Profile...</div>
        </div>
      );
  }

  if (error || !user) {
      return (
        <div className="farmer-profile-page" style={{ 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
          background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
        }}>
          <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
          <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'Profile Not Found'}</div>
          <button className="fp-save-btn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      );
  }

  const isFarmer = user.role === 'Farmer' || user.role === 'farmer' || !user.role;
  const initials = (user.name || 'U').slice(0, 2).toUpperCase();
  const isActive = user.isActive !== false;

  const farmSize   = user.farmSize   ? `${user.farmSize} Acres` : 'N/A';
  const cropVar    = user.cropVariety || user.caneVariety || 'Not Specified';
  const estYield   = user.estimatedYield || (user.farmSize ? `${Math.round(Number(String(user.farmSize).replace(/\D/g,'')) * 25)} Tons` : 'N/A');
  const harvestDt  = user.preferredHarvestDate || user.harvestDate || null;
  const cropStatus = user.cropStatus || (isActive ? 'Standing Crop' : 'Off Season');
  const workers    = user.workersNeeded || user.labourRequired || 'N/A';
  const hType      = user.harvestType || 'Manual';
  const dist       = user.distanceFromFactory ? `${user.distanceFromFactory} km` : 'N/A';
  const village    = user.village || user.location || 'Location not specified';
  const roadAccess = user.roadAccessibility || 'Truck Accessible';

  const df = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
        <div className="fp-noise" />
        <div className="fp-bg-glow" />

        <div className="fdb-container">
            <button className="fdb-back-btn" onClick={() => navigate(-1)}>← Back</button>
            
            {/* HERO SECTION */}
            <div className="fdb-hero">
                <div className="fdb-hero-left">
                    <div className="fdb-hero-header">
                        <div className="fdb-avatar-lg">
                            {initials}
                            <div className="fdb-avatar-ring"></div>
                        </div>
                        <div className="fdb-hero-info">
                            <div className="fdb-hero-title-wrap">
                                <h1 className="fdb-hero-title">{user.name || 'Unknown User'}</h1>
                                {isActive && <span className="fdb-badge-verified">✓ Active</span>}
                            </div>
                            <div className="fdb-hero-meta">
                                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {village}{user.region ? ` • ${user.region}` : ''}</span>
                                <span className="fdb-hero-dot">•</span>
                                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg> {user.phone || 'Phone N/A'}</span>
                            </div>
                            <p className="fdb-hero-tagline">{user.description || (isFarmer ? 'Harvest ready sugarcane farmer.' : 'Experienced Harvest Manager.')}</p>
                        </div>
                    </div>
                </div>
                <div className="fdb-hero-right">
                    {isFarmer ? (
                      <>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{farmSize.split(' ')[0]} <span className="fdb-stat-unit">{farmSize.split(' ')[1] || 'Acres'}</span></div>
                                <div className="fdb-stat-lbl">Total Area</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22V12 M12 12C12 12 7 9 7 4a5 5 0 0 1 10 0c0 5-5 8-5 8z M4 22h16"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{estYield.split(' ')[0]} <span className="fdb-stat-unit">{estYield.split(' ')[1] || 'Tons'}</span></div>
                                <div className="fdb-stat-lbl">Est. Yield</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{workers}</div>
                                <div className="fdb-stat-lbl">Workers Needed</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="10" r="3"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{dist.split(' ')[0]} <span className="fdb-stat-unit">{dist.split(' ')[1] || 'km'}</span></div>
                                <div className="fdb-stat-lbl">Distance</div>
                            </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{user.priceRange || 'N/A'}</div>
                                <div className="fdb-stat-lbl">Price Range</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{user.teamSize || 'N/A'}</div>
                                <div className="fdb-stat-lbl">Team Size</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{user.seasonsCompleted || '0'}</div>
                                <div className="fdb-stat-lbl">Seasons Done</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{user.reliabilityRating ? `${user.reliabilityRating}/10` : 'New'}</div>
                                <div className="fdb-stat-lbl">Reliability</div>
                            </div>
                        </div>
                      </>
                    )}
                </div>
            </div>

            <div className="fdb-grid-main">
                <div className="fdb-grid-left">
                    {/* FARM & CROP / MANAGEMENT INFO */}
                    {isFarmer ? (
                      <section className="fdb-section">
                          <h2 className="fdb-section-title">Farm & Crop Information</h2>
                          <div className="fdb-overview-grid">
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Total Cane Area</div>
                                  <div className="fdb-info-val" style={{color: 'var(--green)'}}>{farmSize}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Cane Variety</div>
                                  <div className="fdb-info-val">{cropVar}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Crop Status</div>
                                  <div className="fdb-info-val" style={{color: 'var(--green)'}}>{cropStatus}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Estimated Yield</div>
                                  <div className="fdb-info-val" style={{color: 'var(--green)'}}>{estYield}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Preferred Harvest</div>
                                  <div className="fdb-info-val">{df(harvestDt)}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Experience</div>
                                  <div className="fdb-info-val">{user.experience ? `${user.experience} Yrs` : 'N/A'}</div>
                              </div>
                          </div>
                      </section>
                    ) : (
                      <section className="fdb-section">
                          <h2 className="fdb-section-title">Management & Operations</h2>
                          <div className="fdb-overview-grid">
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Experience</div>
                                  <div className="fdb-info-val" style={{color: 'var(--green)'}}>{user.managementExperience || user.experience ? `${user.managementExperience || user.experience} Yrs` : 'N/A'}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Team Size</div>
                                  <div className="fdb-info-val">{user.teamSize || 'N/A'}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Price Range</div>
                                  <div className="fdb-info-val" style={{color: 'var(--green)'}}>{user.priceRange || 'N/A'}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Rates Negotiable</div>
                                  <div className="fdb-info-val">{user.isNegotiable !== false ? 'Yes' : 'No'}</div>
                              </div>
                              <div className="fdb-info-card full-width">
                                  <div className="fdb-info-lbl">Services Offered</div>
                                  <div className="fdb-info-val">{user.servicesOffered || 'N/A'}</div>
                              </div>
                              <div className="fdb-info-card full-width">
                                  <div className="fdb-info-lbl">Management Operations</div>
                                  <div className="fdb-info-val">{user.managementOperations || 'N/A'}</div>
                              </div>
                          </div>
                      </section>
                    )}

                    {/* HARVEST / WORKFORCE REQUIREMENTS */}
                    {isFarmer ? (
                      <section className="fdb-section">
                          <h2 className="fdb-section-title">Harvest Requirements</h2>
                          <div className="fdb-overview-grid">
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Workers Required</div>
                                  <div className="fdb-info-val" style={{color: 'var(--green)'}}>{workers}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Harvest Type</div>
                                  <div className="fdb-info-val">{hType}</div>
                              </div>
                              <div className="fdb-info-card full-width">
                                  <div className="fdb-info-lbl">Transport Required</div>
                                  <div className="fdb-info-val">{user.transportRequired !== false ? 'Yes — Truck Access' : 'Self-Arranged'}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Machine Requirement</div>
                                  <div className="fdb-info-val">{user.machineRequired || 'Manual Preferred'}</div>
                              </div>
                              <div className="fdb-info-card">
                                  <div className="fdb-info-lbl">Urgency Level</div>
                                  <div className="fdb-info-val">{user.urgencyLevel || 'Normal Season'}</div>
                              </div>
                          </div>
                      </section>
                    ) : (
                      <section className="fdb-section">
                          <h2 className="fdb-section-title">Workforce Capabilities</h2>
                          <div className="fdb-overview-grid">
                              <div className="fdb-info-card full-width">
                                  <div className="fdb-info-lbl">Worker Types Managed</div>
                                  <div className="fdb-info-val" style={{color: 'var(--green)'}}>{Array.isArray(user.workerTypes) ? user.workerTypes.join(', ') : (user.workerTypes || 'N/A')}</div>
                              </div>
                              <div className="fdb-info-card full-width">
                                  <div className="fdb-info-lbl">Working Areas / Coverage</div>
                                  <div className="fdb-info-val">{Array.isArray(user.workingAreas) ? user.workingAreas.join(', ') : (user.workingAreas || 'N/A')}</div>
                              </div>
                          </div>
                      </section>
                    )}
                </div>

                <div className="fdb-grid-right">
                    {/* ACTION PANEL */}
                    <section className="fdb-section" style={{ background: 'rgba(126,200,67,0.05)', borderColor: 'rgba(126,200,67,0.1)' }}>
                        <h2 className="fdb-section-title">Contact User</h2>
                        <div className="fdb-analytics-wrap" style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
                            {user.email && (
                              <a href={`mailto:${user.email}`} className="fdb-contact-btn" style={{ background: 'var(--green)', color: '#0b0f0b', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Send Proposal
                              </a>
                            )}
                            {user.phone && (
                              <a href={`tel:${user.phone}`} className="fdb-contact-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg> Call Direct
                              </a>
                            )}
                        </div>
                    </section>

                    {/* LOCATION & LOGISTICS */}
                    <section className="fdb-section">
                        <h2 className="fdb-section-title">Logistics & Location</h2>
                        <div className="fdb-overview-grid">
                            <div className="fdb-info-card full-width">
                                <div className="fdb-info-lbl">Village / Taluka</div>
                                <div className="fdb-info-val">{village}</div>
                            </div>
                            {isFarmer && (
                              <>
                                <div className="fdb-info-card">
                                    <div className="fdb-info-lbl">Factory Distance</div>
                                    <div className="fdb-info-val" style={{color: 'var(--green)'}}>{dist}</div>
                                </div>
                                <div className="fdb-info-card">
                                    <div className="fdb-info-lbl">Road Access</div>
                                    <div className="fdb-info-val">{roadAccess}</div>
                                </div>
                              </>
                            )}
                        </div>
                    </section>

                    {/* HISTORY */}
                    <section className="fdb-section">
                        <h2 className="fdb-section-title">Track Record</h2>
                        <div className="fdb-overview-grid">
                            <div className="fdb-info-card">
                                <div className="fdb-info-lbl">Reliability</div>
                                <div className="fdb-info-val">{user.reliabilityRating ? `${user.reliabilityRating}/10` : 'New'}</div>
                            </div>
                            <div className="fdb-info-card">
                                <div className="fdb-info-lbl">Seasons</div>
                                <div className="fdb-info-val" style={{color: 'var(--green)'}}>{user.seasonsCompleted || '0'}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(126,200,67,0.05)', borderRadius: '8px', border: '1px solid rgba(126,200,67,0.1)', color: user.seasonsCompleted ? 'var(--green)' : '#888', fontSize: '0.85rem' }}>
                            {user.seasonsCompleted ? `${user.seasonsCompleted} seasons of verified operations` : 'No prior coordination history recorded'}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
  );
};

export default UserProfilePage;
