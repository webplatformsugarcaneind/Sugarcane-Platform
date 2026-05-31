import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateListingFormNew from '../components/CreateListingFormNew';

const EditListingPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/api/listings/${listingId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setListing(response.data.data);
        } else {
          setError('Failed to load listing details.');
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleUpdateListing = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const res = await axios.put(`${API_BASE_URL}/api/listings/${listingId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        alert('✅ Listing updated successfully!');
        navigate(`/farmer/listing/${listingId}`);
      }
    } catch (err) {
      console.error('Error updating listing:', err);
      alert(`❌ ${err.response?.data?.message || 'Failed to update listing.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0b0f0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7ec843]"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="w-full min-h-screen bg-[#0b0f0b] flex flex-col items-center justify-center p-10 text-white">
        <h2 className="text-2xl font-bold mb-4">❌ {error || 'Listing not found'}</h2>
        <button 
          onClick={() => navigate('/farmer/marketplace')}
          className="bg-[#7ec843] text-black px-6 py-2 rounded-lg font-bold"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="farmer-profile-page w-full min-h-screen flex flex-col bg-[#0b0f0b] relative overflow-x-hidden" style={{ marginTop: '-64px' }}>
      <CreateListingFormNew 
        onSubmit={handleUpdateListing} 
        isSubmitting={isSubmitting} 
        onCancel={() => navigate(`/farmer/listing/${listingId}`)} 
        initialData={listing}
      />
    </div>
  );
};

export default EditListingPage;
