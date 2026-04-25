import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostBillForm from '../components/PostBillForm.jsx';
import './FactoryPostBillPage.css';

const FactoryPostBillPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleBillSubmit = async (billData) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/factory/bills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    farmerId: billData.farmerId,
                    cropQuantity: billData.cropQuantity,
                    totalAmount: billData.totalAmount
                })
            });

            const data = await response.json();

            if (response.ok) {
                const farmerName = billData?.farmerDetails?.name || 'selected farmer';
                setSuccess(`Bill created successfully for ${farmerName}.`);
            } else {
                setError(data.message || 'Failed to create bill. Please try again.');
            }
        } catch (submitError) {
            console.error('Error creating bill:', submitError);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fpb-page">
            <div className="fpb-header">
                <button className="fpb-back" onClick={() => navigate('/factory/dashboard')}>
                    Back to Dashboard
                </button>
                <h1>Post Bill</h1>
            </div>

            {error && <div className="fpb-alert error">{error}</div>}
            {success && <div className="fpb-alert success">{success}</div>}

            <div className="fpb-card">
                <PostBillForm
                    onSubmit={handleBillSubmit}
                    onCancel={() => navigate('/factory/dashboard')}
                    isLoading={isSubmitting}
                />
            </div>
        </div>
    );
};

export default FactoryPostBillPage;
