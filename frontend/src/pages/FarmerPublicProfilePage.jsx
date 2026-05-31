import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css'; // Leverage exact unified CSS

const FarmerPublicProfilePage = () => {
    const { farmerId } = useParams();
    const navigate = useNavigate();
    
    const [farmer, setFarmer] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBuyForm, setShowBuyForm] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);

    // Cursor tracking
    
    const [buyForm, setBuyForm] = useState({
        buyerName: '', buyerEmail: '', buyerPhone: '', quantityWanted: '',
        proposedPrice: '', deliveryLocation: '', message: '', urgency: 'normal'
    });

    const navigateToMarketplace = () => {
        try {
            navigate('/farmer/marketplace');
            setTimeout(() => {
                if (window.location.pathname !== '/farmer/marketplace') {
                    window.location.href = '/farmer/marketplace';
                }
            }, 100);
        } catch (error) {
            window.location.href = '/farmer/marketplace';
        }
    };

    useEffect(() => {
        const fetchFarmerData = async () => {
            try {
                setLoading(true);
                setError(null);
                const profileResponse = await axios.get(`${API_BASE_URL}/api/public/farmers/${farmerId}`);
                setFarmer(profileResponse.data.data);

                const listingsResponse = await axios.get(`${API_BASE_URL}/api/listings/marketplace?farmer_id=${farmerId}`);
                setListings(listingsResponse.data.data || []);
            } catch (err) {
                console.error('Error fetching farmer data:', err);
                setError(err.response?.data?.message || 'Failed to load farmer profile');
            } finally {
                setLoading(false);
            }
        };

        if (farmerId) fetchFarmerData();
    }, [farmerId]);

    const handleBuyFormChange = (e) => {
        const { name, value } = e.target;
        setBuyForm(prev => ({ ...prev, [name]: value }));
    };

    const handleShowBuyForm = (listing) => {
        setSelectedListing(listing);
        setBuyForm(prev => ({
            ...prev,
            quantityWanted: listing.quantity_in_tons,
            proposedPrice: listing.expected_price_per_ton
        }));
        setShowBuyForm(true);
    };

    const handleSubmitBuyOrder = async (e) => {
        e.preventDefault();
        if (!selectedListing) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to place a buy order');
                navigate('/login');
                return;
            }

            const orderData = {
                listingId: selectedListing._id,
                farmerId: farmer._id,
                ...buyForm,
                totalAmount: parseFloat(buyForm.quantityWanted) * parseFloat(buyForm.proposedPrice)
            };

            await axios.post(`${API_BASE_URL}/api/orders/create`, orderData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            alert('🎉 Buy order submitted successfully!');
            setShowBuyForm(false);
            setBuyForm({
                buyerName: '', buyerEmail: '', buyerPhone: '', quantityWanted: '',
                proposedPrice: '', deliveryLocation: '', message: '', urgency: 'normal'
            });

        } catch (err) {
            console.error('Error submitting buy order:', err);
            alert('❌ Failed to submit buy order. Please try again.');
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

    if (loading) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: 'var(--green)' }}>Loading Farmer Profile...</div>
          </div>
        );
    }

    if (error || !farmer) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'Farmer Not Found'}</div>
            <button className="fp-save-btn" onClick={navigateToMarketplace}>← Back to Marketplace</button>
          </div>
        );
    }

    const initials = farmer.name ? farmer.name.substring(0, 2).toUpperCase() : 'F';

    return (
        <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
            <div className="fp-noise" />
            <div className="fp-bg-glow" />

            <div className="fp-layout-shell">
                <aside className="fp-sidebar" >
                    <div className="fp-sidebar-profile">
                        <div className="fp-avatar-wrap">
                            <div className="fp-avatar">{initials}</div>
                            <div className="fp-avatar-ring"></div>
                        </div>
                        <div className="fp-user-name">{farmer.name || 'Farmer'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot"></span>
                            Farmer
                        </div>
                    </div>

                    <div className="fp-stats-grid">
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{listings.length}</div>
                            <div className="fp-stat-lbl">Active Listings</div>
                        </div>
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{farmer.totalSales || '0'}</div>
                            <div className="fp-stat-lbl">Total Sales</div>
                        </div>
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">Farmer Profile</div>
                            <h1 className="fp-title">{farmer.name}'s <em className="fp-highlight">Profile</em></h1>
                            <p className="fp-subtitle">@{farmer.username || 'unknown'}</p>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={navigateToMarketplace} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back to Marketplace</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">📞</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Contact Information</h2>
                                <div className="fp-card-sub">Reach out directly to this farmer</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                {farmer.email && (
                                    <div className="fp-field full-width">
                                        <label>Email Address</label>
                                        <input type="email" readOnly value={farmer.email} />
                                    </div>
                                )}
                                {farmer.phone && (
                                    <div className="fp-field full-width">
                                        <label>Phone Number</label>
                                        <input type="tel" readOnly value={farmer.phone} />
                                    </div>
                                )}
                                {farmer.location && (
                                    <div className="fp-field full-width">
                                        <label>Location</label>
                                        <input type="text" readOnly value={farmer.location} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">🌾</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Available Listings</h2>
                                <div className="fp-card-sub">Crops currently available for purchase</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            {listings.length === 0 ? (
                                <p style={{ color: 'rgba(240,245,236,0.5)', padding: '2rem 0', textAlign: 'center' }}>This farmer currently has no active listings.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {listings.map(listing => (
                                        <div key={listing._id} style={{ background: '#101510', border: '1px solid rgba(126,200,67,0.2)', borderRadius: '12px', padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                                                <h3 style={{ margin: 0, color: 'var(--green)', fontSize: '1.25rem' }}>{listing.title}</h3>
                                                <span style={{ background: 'rgba(126,200,67,0.1)', color: 'var(--green)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>{listing.crop_variety}</span>
                                            </div>
                                            
                                            <div className="fp-form-grid" style={{ marginBottom: '1rem' }}>
                                                <div className="fp-field" style={{ marginBottom: '0' }}>
                                                    <label>Quantity</label>
                                                    <div style={{ color: '#f0f5ec' }}>{listing.quantity_in_tons} gunthas</div>
                                                </div>
                                                <div className="fp-field" style={{ marginBottom: '0' }}>
                                                    <label>Price</label>
                                                    <div style={{ color: '#f0f5ec' }}>{formatPrice(listing.expected_price_per_ton)} <small>/guntha</small></div>
                                                </div>
                                                <div className="fp-field" style={{ marginBottom: '0' }}>
                                                    <label>Location</label>
                                                    <div style={{ color: '#f0f5ec' }}>{listing.location}</div>
                                                </div>
                                                <div className="fp-field" style={{ marginBottom: '0' }}>
                                                    <label>Harvest Date</label>
                                                    <div style={{ color: '#f0f5ec' }}>{formatDate(listing.harvest_availability_date)}</div>
                                                </div>
                                            </div>

                                            {listing.description && (
                                                <p style={{ color: 'rgba(240,245,236,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>{listing.description}</p>
                                            )}

                                            <div style={{ background: 'rgba(126,200,67,0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                <span style={{ color: 'rgba(240,245,236,0.5)', fontSize: '0.9rem' }}>Total Value:</span>
                                                <span style={{ color: 'var(--green)', fontWeight: '700', fontSize: '1.2rem' }}>{formatPrice(listing.quantity_in_tons * listing.expected_price_per_ton)}</span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => handleShowBuyForm(listing)} className="fp-save-btn" style={{ flex: 1 }}>💰 Place Buy Order</button>
                                                <button onClick={() => {
                                                    const msg = `Hi ${farmer.name}, I'm interested in your listing: "${listing.title}".`;
                                                    window.location.href = `mailto:${farmer.email}?subject=Listing Inquiry&body=${encodeURIComponent(msg)}`;
                                                }} className="fp-save-btn" style={{ background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)', flex: 1 }}>📧 Contact</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            {/* Buy Form Modal */}
            {showBuyForm && selectedListing && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#151d14', border: '1px solid rgba(126,200,67,0.2)', padding: '2rem', borderRadius: '15px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                            <h2 style={{ color: '#f0f5ec', margin: 0 }}>💰 Place Buy Order</h2>
                            <button onClick={() => setShowBuyForm(false)} style={{ background: 'transparent', border: 'none', color: '#f0f5ec', fontSize: '1.5rem',  }}>×</button>
                        </div>

                        <div className="fp-field full-width" style={{ marginBottom: '1.5rem' }}>
                             <label style={{ color: 'var(--green)' }}>Order Summary</label>
                             <div style={{ background: '#0b0f0b', padding: '1rem', borderRadius: '8px', color: '#f0f5ec', fontSize: '0.9rem' }}>
                                <div><strong>Crop:</strong> {selectedListing.title} ({selectedListing.crop_variety})</div>
                                <div><strong>Available:</strong> {selectedListing.quantity_in_tons} gunthas</div>
                                <div><strong>Listed Price:</strong> {formatPrice(selectedListing.expected_price_per_ton)}/guntha</div>
                             </div>
                        </div>

                        <form onSubmit={handleSubmitBuyOrder}>
                            <div className="fp-form-grid">
                                <div className="fp-field full-width"><label>Your Name *</label><input type="text" name="buyerName" value={buyForm.buyerName} onChange={handleBuyFormChange} required /></div>
                                <div className="fp-field"><label>Your Email *</label><input type="email" name="buyerEmail" value={buyForm.buyerEmail} onChange={handleBuyFormChange} required /></div>
                                <div className="fp-field"><label>Your Phone *</label><input type="tel" name="buyerPhone" value={buyForm.buyerPhone} onChange={handleBuyFormChange} required /></div>
                                <div className="fp-field"><label>Quantity (gunthas) *</label><input type="number" name="quantityWanted" min="0.1" max={selectedListing.quantity_in_tons} step="0.1" value={buyForm.quantityWanted} onChange={handleBuyFormChange} required /></div>
                                <div className="fp-field"><label>Proposed Price/Guntha *</label><input type="number" name="proposedPrice" value={buyForm.proposedPrice} onChange={handleBuyFormChange} required /></div>
                                <div className="fp-field"><label>Urgency</label>
                                    <select name="urgency" value={buyForm.urgency} onChange={handleBuyFormChange} className="fp-input">
                                        <option value="normal">Normal</option>
                                        <option value="high">High Priority</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="fp-field full-width"><label>Delivery Location *</label><input type="text" name="deliveryLocation" value={buyForm.deliveryLocation} onChange={handleBuyFormChange} required /></div>
                                <div className="fp-field full-width"><label>Message</label><textarea name="message" value={buyForm.message} onChange={handleBuyFormChange} rows="2"></textarea></div>
                            </div>

                            {buyForm.quantityWanted && buyForm.proposedPrice && (
                                <div style={{ background: 'rgba(126,200,67,0.1)', padding: '1rem', borderRadius: '8px', color: '#f0f5ec', margin: '1rem 0', textAlign: 'center' }}>
                                    Target Value: <span style={{ color: 'var(--green)', fontWeight: '700' }}>{formatPrice(buyForm.quantityWanted * buyForm.proposedPrice)}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowBuyForm(false)} className="fp-save-btn" style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Cancel</button>
                                <button type="submit" className="fp-save-btn" style={{ flex: 2 }}>Submit Buy Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerPublicProfilePage;
