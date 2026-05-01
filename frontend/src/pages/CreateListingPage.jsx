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

      const res = await axios.post('http://localhost:5000/api/listings/create', formData, {
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
    <div className="create-listing-standalone">
      <CreateListingFormNew 
        onSubmit={handleCreateListing} 
        isSubmitting={isSubmitting} 
        onCancel={() => navigate('/farmer/marketplace')} 
      />
    </div>
  );
};

export default CreateListingPage;
