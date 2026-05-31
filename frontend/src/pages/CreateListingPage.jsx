import { API_BASE_URL } from '../config/api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateListingFormNew from '../components/CreateListingFormNew';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateListing = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const res = await axios.post(`${API_BASE_URL}/api/listings/create`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`
          // Axios handles FormData Content-Type automatically
        }
      });

      if (res.data.success) {
        alert('🎉 Sugarcane listing created successfully!');
        navigate('/farmer/marketplace');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      alert(`❌ ${err.response?.data?.message || 'Failed to create listing.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="farmer-profile-page w-full min-h-screen flex flex-col bg-[#0b0f0b] relative overflow-x-hidden" style={{ marginTop: '-64px' }}>
      <CreateListingFormNew 
        onSubmit={handleCreateListing} 
        isSubmitting={isSubmitting} 
        onCancel={() => navigate('/farmer/marketplace')} 
      />
    </div>
  );
};

export default CreateListingPage;
