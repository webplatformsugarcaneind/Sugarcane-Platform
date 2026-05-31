import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css';

const SendInquiryPage = () => {
    const { listingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [listing, setListing] = useState(location.state?.listing || null);
    const [loading, setLoading] = useState(!listing);
    const [error, setError] = useState(null);

    const [buyForm, setBuyForm] = useState({
        buyerName: '',
        buyerPhone: '',
        buyerEmail: '',
        quantityWanted: '',
        proposedPrice: '',
        deliveryLocation: '',
        message: '',
        urgency: 'normal'
    });

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
        
        const fetchListing = async () => {
            if (listing) {
                initializeForm(listing);
                return;
            }
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get(`${API_BASE_URL}/api/listings/${listingId}`, { headers });
                if (response.data.success) {
                    setListing(response.data.data);
                    initializeForm(response.data.data);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load listing details.');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [listingId, listing]);

    const initializeForm = (lst) => {
        const price = lst.price_details?.price_per_unit || lst.expected_price_per_ton || 0;
        const qty = lst.quantity_available?.value || lst.quantity_in_tons || 0;
        setBuyForm(prev => ({
            ...prev,
            quantityWanted: qty,
            proposedPrice: price
        }));
    };

    const handleBuyFormChange = (e) => {
        const { name, value } = e.target;
        setBuyForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitBuyOrder = async (e) => {
        e.preventDefault();
        if (!listing) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to place an inquiry');
                navigate('/login');
                return;
            }
            const orderData = {
                listingId: listing._id,
                farmerId: typeof listing.farmer_id === 'object' ? listing.farmer_id._id : listing.farmer_id,
                ...buyForm,
                totalAmount: parseFloat(buyForm.quantityWanted) * parseFloat(buyForm.proposedPrice)
            };
            await axios.post(`${API_BASE_URL}/api/orders/create`, orderData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            alert('🎉 Inquiry submitted successfully! The farmer will contact you soon.');
            navigate(-1);
        } catch (err) {
            console.error('Error submitting inquiry:', err);
            alert('❌ Failed to submit inquiry. Please try again.');
        }
    };

    if (loading) return <div className="farmer-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b', minHeight: '100vh' }}><div className="fp-spinner" style={{ borderTopColor: 'var(--green)' }}></div></div>;
    if (error || !listing) return <div className="farmer-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b', color: '#ff6b6b', minHeight: '100vh' }}>{error}</div>;

    const unit = listing.quantity_available?.unit || 'Guntha';
    const quantityAvailable = listing.quantity_available?.value || listing.quantity_in_tons || 0;
    const pricePerUnit = listing.price_details?.price_per_unit || listing.expected_price_per_ton || 0;

    return (
        <div className="farmer-profile-page full-screen-form w-full min-h-screen flex justify-center relative overflow-x-hidden bg-[#0b0f0b]" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
            <div className="fp-noise" />
            
            <div className="fp-layout-shell" style={{ width: '100%', padding: '40px', position: 'relative', zIndex: 1 }}>
                <div className="form-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '60px' }}>
                    
                    {/* LEFT COLUMN: HEADER & INFO */}
                    <aside className="form-sidebar" style={{ gridColumn: 'span 3' }}>
                        <div style={{ position: 'sticky', top: '90px' }}>
                            <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 0 24px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                ← Back to Listing
                            </button>
                            <div className="fp-eyebrow" style={{ color: 'var(--green)', letterSpacing: '2px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '15px' }}>Purchase Inquiry</div>
                            <h1 className="fp-title" style={{ fontSize: '2.2rem', lineHeight: '1.2', marginBottom: '20px', fontWeight: '900' }}>
                                Send <br /><em className="fp-highlight" style={{ color: 'var(--green)', fontStyle: 'normal' }}>Inquiry</em> <br />to Seller
                            </h1>
                            <p className="fp-subtitle" style={{ fontSize: '1.1rem', color: '#888', lineHeight: '1.6', marginBottom: '40px', maxWidth: '300px' }}>
                                You are inquiring about <strong style={{color: '#fff'}}>{listing.title || listing.crop_variety}</strong>. Fill out the details below to negotiate the best deal.
                            </p>
                            
                            <div className="sidebar-guide" style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid #222' }}>
                                <h4 style={{ color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>💡</span> Buyer Tips
                                </h4>
                                <ul style={{ color: '#888', fontSize: '0.9rem', padding: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <li>• Suggest a realistic price</li>
                                    <li>• Be clear about delivery</li>
                                    <li>• Mention urgency to get faster replies</li>
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT COLUMN: THE FORM */}
                    <main className="form-main-content" style={{ gridColumn: 'span 9' }}>
                        <form onSubmit={handleSubmitBuyOrder} className="premium-form-layout" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            {/* SECTION 1: BUYER INFORMATION */}
                            <section className="fp-card">
                                <div className="fp-card-header">
                                    <div className="fp-card-icon">👤</div>
                                    <div className="fp-card-txt">
                                        <h2 className="fp-card-title">Buyer Details</h2>
                                        <div className="fp-card-sub">Your contact information</div>
                                    </div>
                                </div>
                                <div className="fp-card-body">
                                    <div className="fp-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                        <div className="fp-field" style={{ gridColumn: 'span 2' }}>
                                            <label>Your Name *</label>
                                            <input type="text" name="buyerName" value={buyForm.buyerName} onChange={handleBuyFormChange} placeholder="Enter your full name" required />
                                        </div>
                                        <div className="fp-field">
                                            <label>Phone Number *</label>
                                            <input type="tel" name="buyerPhone" value={buyForm.buyerPhone} onChange={handleBuyFormChange} placeholder="+91" required />
                                        </div>
                                        <div className="fp-field">
                                            <label>Email Address</label>
                                            <input type="email" name="buyerEmail" value={buyForm.buyerEmail} onChange={handleBuyFormChange} placeholder="For updates (optional)" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 2: ORDER DETAILS */}
                            <section className="fp-card">
                                <div className="fp-card-header">
                                    <div className="fp-card-icon">📦</div>
                                    <div className="fp-card-txt">
                                        <h2 className="fp-card-title">Order Request</h2>
                                        <div className="fp-card-sub">Specify quantity and your proposed price</div>
                                    </div>
                                </div>
                                <div className="fp-card-body">
                                    <div className="fp-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                        <div className="fp-field">
                                            <label>Quantity Needed ({unit}s) *</label>
                                            <input type="number" name="quantityWanted" value={buyForm.quantityWanted} onChange={handleBuyFormChange} required max={quantityAvailable} />
                                            <span className="error-txt" style={{ color: 'var(--muted)', marginTop: '6px' }}>Max available: {quantityAvailable} {unit}s</span>
                                        </div>
                                        <div className="fp-field">
                                            <label>Proposed Price (₹/{unit}) *</label>
                                            <input type="number" name="proposedPrice" value={buyForm.proposedPrice} onChange={handleBuyFormChange} required />
                                            <span className="error-txt" style={{ color: 'var(--muted)', marginTop: '6px' }}>Seller's price: ₹{pricePerUnit}</span>
                                        </div>

                                        <div className="fp-field" style={{ gridColumn: 'span 2', marginTop: '10px', padding: '24px', background: 'rgba(126,200,67,0.05)', borderRadius: '16px', border: '1px solid rgba(126,200,67,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '4px' }}>Estimated Total Offer</div>
                                                <div style={{ fontSize: '1.75rem', color: 'var(--green)', fontWeight: '800' }}>
                                                ₹{((parseFloat(buyForm.quantityWanted)||0) * (parseFloat(buyForm.proposedPrice)||0)).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 3: LOGISTICS & MSG */}
                            <section className="fp-card">
                                <div className="fp-card-header">
                                    <div className="fp-card-icon">🚚</div>
                                    <div className="fp-card-txt">
                                        <h2 className="fp-card-title">Logistics & Additional Details</h2>
                                        <div className="fp-card-sub">Delivery location and urgency</div>
                                    </div>
                                </div>
                                <div className="fp-card-body">
                                    <div className="fp-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                        <div className="fp-field">
                                            <label>Delivery Location</label>
                                            <input type="text" name="deliveryLocation" value={buyForm.deliveryLocation} onChange={handleBuyFormChange} placeholder="City / District" />
                                        </div>
                                        <div className="fp-field">
                                            <label>Urgency Level</label>
                                            <select name="urgency" value={buyForm.urgency} onChange={handleBuyFormChange}>
                                                <option value="low">Low (Flexible)</option>
                                                <option value="normal">Normal (Within 2 weeks)</option>
                                                <option value="high">High (Within 1 week)</option>
                                                <option value="urgent">Urgent (Immediate)</option>
                                            </select>
                                        </div>
                                        <div className="fp-field" style={{ gridColumn: 'span 2' }}>
                                            <label>Additional Message</label>
                                            <textarea name="message" value={buyForm.message} onChange={handleBuyFormChange} placeholder="Any specific requirements or questions for the seller..." rows="4" style={{ resize: 'vertical' }}></textarea>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '20px', paddingBottom: '100px' }}>
                                <button type="button" className="btn-base btn-outline" onClick={() => navigate(-1)} style={{ padding: '14px 32px' }}>Cancel</button>
                                <button type="submit" className="btn-base btn-primary" style={{ minWidth: '280px', padding: '14px 32px' }}>
                                    🚀 Submit Inquiry
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>

            <style>{`
                .error-txt { font-size: 0.85rem; display: block; }
                .full-screen-form select, .full-screen-form input[type="text"], .full-screen-form input[type="number"], .full-screen-form input[type="email"], .full-screen-form input[type="tel"], .full-screen-form textarea {
                    width: 100%;
                    padding: 14px;
                    background: var(--surface-2);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    color: var(--white);
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .full-screen-form select:focus, .full-screen-form input:focus, .full-screen-form textarea:focus {
                    border-color: var(--green);
                }
                .full-screen-form select option {
                    background: #0b0f0b;
                }
                
                @media (max-width: 1024px) {
                    .form-layout-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
                    .form-sidebar { grid-column: span 1 !important; text-align: center; }
                    .form-sidebar aside { position: static !important; }
                    .form-sidebar h1 { fontSize: 2.5rem !important; }
                    .form-sidebar p { margin: 0 auto 30px !important; }
                    .form-main-content { grid-column: span 1 !important; }
                }
            `}</style>
        </div>
    );
};

export default SendInquiryPage;
