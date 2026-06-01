import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import '../pages/FarmerProfile.css';

const CreateListingForm = ({ onSubmit, isSubmitting = false, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    sugarcane_variety: initialData?.sugarcane_variety || initialData?.crop_variety || '',
    crop_type: initialData?.crop_type || 'Harvest Cane',
    certification_details: initialData?.seed_quality?.certification_details || '',
    crop_age: initialData?.crop_age || '',
    germination_percentage: initialData?.germination_percentage || '',
    seed_type: initialData?.seed_type || '2-Bud Setts',
    soil_type: initialData?.soil_type || 'Black Soil',
    irrigation_method: initialData?.irrigation_method || 'Drip',
    quantity_value: initialData?.quantity_available?.value || initialData?.quantity_in_tons || '',
    quantity_unit: initialData?.quantity_available?.unit || 'gunthas',
    unit_type: initialData?.unit_type || 'Guntha',
    price_per_unit: initialData?.price_details?.price_per_unit || initialData?.expected_price_per_ton || '',
    price_negotiable: initialData?.price_details?.price_negotiable ?? true,
    minimum_order_quantity: initialData?.price_details?.minimum_order_quantity || '',
    bulk_discount_available: initialData?.bulk_discount?.available || false,
    bulk_discount_details: initialData?.bulk_discount?.details || '',
    delivery_location: initialData?.delivery_location || initialData?.location || '',
    delivery_method: initialData?.delivery_method || 'Both',
    transport_available: initialData?.transport_available || false,
    delivery_radius: initialData?.delivery_radius || '',
    available_from: initialData?.delivery_timeframe?.available_from?.split('T')[0] || initialData?.harvest_availability_date?.split('T')[0] || '',
    available_until: initialData?.delivery_timeframe?.available_until?.split('T')[0] || '',
    preferred_delivery_time: initialData?.delivery_timeframe?.preferred_delivery_time || 'Flexible',
    harvest_method: initialData?.harvest_method || 'Manual',
    storage_condition: initialData?.storage_condition || 'Fresh',
    description: initialData?.description || '',
    tags: initialData?.tags || []
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData?.farm_images || []);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [errors, setErrors] = useState({});

  const varieties = ['Co 86032', 'Co 0238', 'Co 62175', 'Co 06022', 'CoM 0265', 'Co 1148', 'Other'];
  const cropTypes = ['Planting Setts', 'Seed Cane', 'Harvest Cane'];
  const soilTypes = ['Black Soil', 'Red Soil', 'Mixed'];
  const irrigationMethods = ['Drip', 'Flood', 'Rain-fed'];
  const deliveryMethods = ['Pickup', 'Farmer Delivery', 'Both'];

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length + existingImages.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index, image) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setImagesToDelete(prev => [...prev, image]);
  };

  const validate = () => {
    const e = {};
    if (!formData.title) e.title = 'Required';
    if (!formData.sugarcane_variety) e.sugarcane_variety = 'Required';
    if (!formData.quantity_value || formData.quantity_value <= 0) e.quantity_value = 'Invalid quantity';
    if (!formData.price_per_unit || formData.price_per_unit <= 0) e.price_per_unit = 'Invalid price';
    if (formData.germination_percentage && (formData.germination_percentage < 0 || formData.germination_percentage > 100)) e.germination_percentage = '0-100 only';
    if (!formData.delivery_location) e.delivery_location = 'Required';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submission = new FormData();
    submission.append('title', formData.title);
    submission.append('sugarcane_variety', formData.sugarcane_variety);
    submission.append('crop_type', formData.crop_type);
    submission.append('seed_quality', JSON.stringify({
      certification_details: formData.certification_details
    }));
    if (formData.crop_age !== '') submission.append('crop_age', formData.crop_age);
    if (formData.germination_percentage !== '') submission.append('germination_percentage', formData.germination_percentage);
    submission.append('seed_type', formData.seed_type);
    submission.append('soil_type', formData.soil_type);
    submission.append('irrigation_method', formData.irrigation_method);
    submission.append('quantity_available', JSON.stringify({
      value: formData.quantity_value,
      unit: formData.quantity_unit
    }));
    submission.append('unit_type', formData.unit_type);
    submission.append('price_details', JSON.stringify({
      price_per_unit: formData.price_per_unit || 0,
      price_negotiable: formData.price_negotiable,
      minimum_order_quantity: formData.minimum_order_quantity || 0
    }));
    submission.append('bulk_discount', JSON.stringify({
      available: formData.bulk_discount_available,
      details: formData.bulk_discount_details
    }));
    submission.append('delivery_location', formData.delivery_location);
    submission.append('delivery_method', formData.delivery_method);
    submission.append('transport_available', formData.transport_available);
    if (formData.delivery_radius !== '') submission.append('delivery_radius', formData.delivery_radius);
    submission.append('delivery_timeframe', JSON.stringify({
      available_from: formData.available_from || null,
      available_until: formData.available_until || null,
      preferred_delivery_time: formData.preferred_delivery_time
    }));
    submission.append('harvest_method', formData.harvest_method);
    submission.append('storage_condition', formData.storage_condition);
    submission.append('description', formData.description);

    imageFiles.forEach(file => submission.append('farm_images', file));
    
    // Send info about existing images if editing
    if (initialData) {
      submission.append('keep_existing_images', JSON.stringify(existingImages));
      submission.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    if (onSubmit) await onSubmit(submission);
  };

  return (
    <div className="farmer-profile-page full-screen-form w-full min-h-screen flex justify-center relative overflow-x-hidden bg-[#0b0f0b]" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
      <div className="fp-noise" />
      
      <div className="fp-layout-shell" style={{ maxWidth: '1400px', width: '100%', padding: '60px 40px', position: 'relative', zIndex: 1 }}>
        <div className="form-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '60px' }}>
          
          {/* LEFT COLUMN: HEADER & INFO */}
          <aside className="form-sidebar" style={{ gridColumn: 'span 4' }}>
            <div style={{ position: 'sticky', top: '90px' }}>
              <div className="fp-eyebrow" style={{ color: 'var(--green)', letterSpacing: '2px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '15px' }}>Marketplace Listing</div>
              <h1 className="fp-title" style={{ fontSize: '2.2rem', lineHeight: '1.2', marginBottom: '20px', fontWeight: '900' }}>
                {initialData ? 'Update' : 'Create'} <br /><em className="fp-highlight" style={{ color: 'var(--green)', fontStyle: 'normal' }}>Sugarcane</em> <br />Listing
              </h1>
              <p className="fp-subtitle" style={{ fontSize: '1.1rem', color: '#888', lineHeight: '1.6', marginBottom: '40px', maxWidth: '300px' }}>
                {initialData 
                  ? 'Update your listing details to keep buyers informed about your crop status.' 
                  : 'Provide accurate technical details about your crop to attract premium buyers and get the best market rates.'}
              </p>
              
              <div className="sidebar-guide" style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid #222' }}>
                <h4 style={{ color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>💡</span> Listing Tips
                </h4>
                <ul style={{ color: '#888', fontSize: '0.9rem', padding: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li>• Fill in soil and growth details</li>
                  <li>• Mention irrigation methods</li>
                  <li>• Be precise with quantity</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: THE FORM */}
          <main className="form-main-content" style={{ gridColumn: 'span 8' }}>
            <form onSubmit={handleSubmit} className="premium-form-layout" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* SECTION 1: PRODUCT INFORMATION */}
              <section className="fp-card">
                <div className="fp-card-header">
                  <div className="fp-card-icon">🏷️</div>
                  <div className="fp-card-txt">
                    <h2 className="fp-card-title">Product Information</h2>
                    <div className="fp-card-sub">Basic details about your sugarcane</div>
                  </div>
                </div>
                <div className="fp-card-body">
                  <div className="fp-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div className="fp-field" style={{ gridColumn: 'span 2' }}>
                      <label>Listing Title *</label>
                      <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. High Yield Co 86032 Seed Cane" required />
                      {errors.title && <span className="error-txt">{errors.title}</span>}
                    </div>
                    <div className="fp-field">
                      <label>Sugarcane Variety *</label>
                      <select name="sugarcane_variety" value={formData.sugarcane_variety} onChange={handleChange} required>
                        <option value="">Select Variety</option>
                        {varieties.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="fp-field">
                      <label>Crop Type *</label>
                      <div className="fp-radio-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        {cropTypes.map(t => (
                          <div key={t} className={`fp-radio-tile ${formData.crop_type === t ? 'selected' : ''}`} onClick={() => setFormData(p => ({...p, crop_type: t}))}>
                            <span className="fp-tile-label" style={{ fontSize: '0.8rem' }}>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: QUALITY & SEED DETAILS */}
              <section className="fp-card">
                <div className="fp-card-header">
                  <div className="fp-card-icon">💎</div>
                  <div className="fp-card-txt">
                    <h2 className="fp-card-title">Quality & Growth Details</h2>
                    <div className="fp-card-sub">Technical specs of the crop</div>
                  </div>
                </div>
                <div className="fp-card-body">
                  <div className="fp-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>

                    <div className="fp-field">
                      <label>Seed Type</label>
                      <select name="seed_type" value={formData.seed_type} onChange={handleChange}>
                        <option value="2-Bud Setts">2-Bud Setts</option>
                        <option value="3-Bud Setts">3-Bud Setts</option>
                        <option value="Mixed Setts">Mixed Setts</option>
                      </select>
                    </div>
                    <div className="fp-field">
                      <label>Crop Age (Months)</label>
                      <input type="number" name="crop_age" value={formData.crop_age} onChange={handleChange} placeholder="12" />
                    </div>
                    <div className="fp-field">
                      <label>Germination %</label>
                      <input type="number" name="germination_percentage" value={formData.germination_percentage} onChange={handleChange} placeholder="95" />
                      {errors.germination_percentage && <span className="error-txt">{errors.germination_percentage}</span>}
                    </div>
                    <div className="fp-field">
                      <label>Soil Type</label>
                      <select name="soil_type" value={formData.soil_type} onChange={handleChange}>
                        {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="fp-field">
                      <label>Irrigation Method</label>
                      <select name="irrigation_method" value={formData.irrigation_method} onChange={handleChange}>
                        {irrigationMethods.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: QUANTITY & PRICING */}
              <section className="fp-card">
                <div className="fp-card-header">
                  <div className="fp-card-icon">💰</div>
                  <div className="fp-card-txt">
                    <h2 className="fp-card-title">Quantity & Pricing</h2>
                    <div className="fp-card-sub">Set your volume and rates</div>
                  </div>
                </div>
                <div className="fp-card-body">
                  <div className="fp-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div className="fp-field">
                      <label>Quantity Available</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" name="quantity_value" value={formData.quantity_value} onChange={handleChange} placeholder="20" style={{ flex: 1 }} />
                        <select name="quantity_unit" value={formData.quantity_unit} onChange={handleChange} style={{ width: '120px' }}>
                          <option value="gunthas">Gunthas</option>
                          <option value="acres">Acres</option>
                        </select>
                      </div>
                    </div>
                    <div className="fp-field">
                      <label>Price Per Unit (₹)</label>
                      <input type="number" name="price_per_unit" value={formData.price_per_unit} onChange={handleChange} placeholder="5000" />
                    </div>
                    
                    <div className="fp-field" style={{ gridColumn: 'span 2', marginTop: '10px', padding: '24px', background: 'rgba(126,200,67,0.05)', borderRadius: '16px', border: '1px solid rgba(126,200,67,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '4px' }}>Estimated Total Value</div>
                        <div style={{ fontSize: '1.75rem', color: 'var(--green)', fontWeight: '800' }}>
                          ₹{(formData.quantity_value * formData.price_per_unit).toLocaleString()}
                        </div>
                      </div>
                      <div className="fp-field" style={{ margin: 0 }}>
                        <label className="checkbox-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                          <input type="checkbox" name="price_negotiable" checked={formData.price_negotiable} onChange={handleChange} /> 
                          <span style={{ fontSize: '0.9rem' }}>Price Negotiable</span>
                        </label>
                      </div>
                    </div>

                    <div className="fp-field">
                      <label>Minimum Order</label>
                      <input type="number" name="minimum_order_quantity" value={formData.minimum_order_quantity} onChange={handleChange} placeholder="1" />
                    </div>
                    <div className="fp-field" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <label className="checkbox-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" name="bulk_discount_available" checked={formData.bulk_discount_available} onChange={handleChange} /> 
                        <span>Offer Bulk Discount?</span>
                      </label>
                    </div>

                    {formData.bulk_discount_available && (
                      <div className="fp-field" style={{ gridColumn: 'span 2' }}>
                        <input type="text" name="bulk_discount_details" value={formData.bulk_discount_details} onChange={handleChange} placeholder="e.g. 10% off for orders over 50 gunthas" />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 4: DELIVERY INFORMATION */}
              <section className="fp-card">
                <div className="fp-card-header">
                  <div className="fp-card-icon">🚚</div>
                  <div className="fp-card-txt">
                    <h2 className="fp-card-title">Delivery & Logistics</h2>
                    <div className="fp-card-sub">How will buyers get the product?</div>
                  </div>
                </div>
                <div className="fp-card-body">
                  <div className="fp-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div className="fp-field" style={{ gridColumn: 'span 2' }}>
                      <label>Pickup/Delivery Location *</label>
                      <input type="text" name="delivery_location" value={formData.delivery_location} onChange={handleChange} placeholder="Village, Taluka, District" required />
                    </div>
                    <div className="fp-field">
                      <label>Delivery Method</label>
                      <select name="delivery_method" value={formData.delivery_method} onChange={handleChange}>
                        {deliveryMethods.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="fp-field">
                      <label>Transport Available?</label>
                      <div className="fp-radio-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div className={`fp-radio-tile ${formData.transport_available ? 'selected' : ''}`} onClick={() => setFormData(p => ({...p, transport_available: true}))}>Yes</div>
                        <div className={`fp-radio-tile ${!formData.transport_available ? 'selected' : ''}`} onClick={() => setFormData(p => ({...p, transport_available: false}))}>No</div>
                      </div>
                    </div>
                    <div className="fp-field">
                      <label>Available From</label>
                      <input type="date" name="available_from" value={formData.available_from} onChange={handleChange} style={{ colorScheme: 'dark' }} />
                    </div>
                    <div className="fp-field">
                      <label>Available Until</label>
                      <input type="date" name="available_until" value={formData.available_until} onChange={handleChange} style={{ colorScheme: 'dark' }} />
                    </div>
                  </div>
                </div>
              </section>


              {/* SECTION 6: ADDITIONAL DETAILS */}
              <section className="fp-card">
                <div className="fp-card-header">
                  <div className="fp-card-icon">⚙️</div>
                  <div className="fp-card-txt">
                    <h2 className="fp-card-title">Farming & Storage</h2>
                    <div className="fp-card-sub">Harvesting methods and features</div>
                  </div>
                </div>
                <div className="fp-card-body">
                  <div className="fp-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div className="fp-field">
                      <label>Harvest Method</label>
                      <div className="fp-radio-grid">
                        <div className={`fp-radio-tile ${formData.harvest_method === 'Manual' ? 'selected' : ''}`} onClick={() => setFormData(p => ({...p, harvest_method: 'Manual'}))}>Manual</div>
                        <div className={`fp-radio-tile ${formData.harvest_method === 'Machine' ? 'selected' : ''}`} onClick={() => setFormData(p => ({...p, harvest_method: 'Machine'}))}>Machine</div>
                      </div>
                    </div>
                    <div className="fp-field">
                      <label>Storage Condition</label>
                      <div className="fp-radio-grid">
                        <div className={`fp-radio-tile ${formData.storage_condition === 'Fresh' ? 'selected' : ''}`} onClick={() => setFormData(p => ({...p, storage_condition: 'Fresh'}))}>Fresh Field</div>
                        <div className={`fp-radio-tile ${formData.storage_condition === 'Stored' ? 'selected' : ''}`} onClick={() => setFormData(p => ({...p, storage_condition: 'Stored'}))}>Stored</div>
                      </div>
                    </div>
                    <div className="fp-field" style={{ gridColumn: 'span 2' }}>
                      <label>Detailed Description</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe organic practices, special features, soil quality details, etc." rows="5" style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
              </section>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '20px', paddingBottom: '100px' }}>
                <button type="button" className="btn-base btn-outline" onClick={onCancel} disabled={isSubmitting} style={{ padding: '14px 32px' }}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" disabled={isSubmitting} style={{ minWidth: '280px', padding: '14px 32px' }}>
                  {isSubmitting 
                    ? (initialData ? 'Updating...' : 'Creating...') 
                    : (initialData ? '💾 Save Listing Changes' : '🚀 Launch Marketplace Listing')}
                </button>
              </div>

            </form>
          </main>
        </div>
      </div>

      <style>{`
        .error-txt { color: #ff6b6b; font-size: 0.75rem; margin-top: 4px; display: block; }
        .full-screen-form select, .full-screen-form input[type="text"], .full-screen-form input[type="number"], .full-screen-form input[type="date"], .full-screen-form textarea {
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

export default CreateListingForm;
