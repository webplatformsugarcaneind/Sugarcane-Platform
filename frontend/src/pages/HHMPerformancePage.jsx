import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HHMPerformancePage.css';

/**
 * HHMPerformancePage Component
 * 
 * Displays HHM's performance metrics including schedules, applications,
 * invitations, success rate, and other KPIs.
 */
const HHMPerformancePage = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPerformanceData();
    }, []);

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await axios.get('/api/hhm/my-performance', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setPerformanceData(response.data.data);

        } catch (err) {
            console.error('Error fetching performance data:', err);
            setError(err.response?.data?.message || 'Failed to load performance data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPerformanceRating = (successRate) => {
        if (successRate >= 80) return { label: 'Excellent', color: '#28a745', icon: '⭐⭐⭐⭐⭐' };
        if (successRate >= 60) return { label: 'Good', color: '#20c997', icon: '⭐⭐⭐⭐' };
        if (successRate >= 40) return { label: 'Average', color: '#ffc107', icon: '⭐⭐⭐' };
        if (successRate >= 20) return { label: 'Below Average', color: '#fd7e14', icon: '⭐⭐' };
        return { label: 'Needs Improvement', color: '#dc3545', icon: '⭐' };
    };

    if (loading) {
        return (
            <div className="performance-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading performance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="performance-page">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Error Loading Performance Data</h3>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchPerformanceData}>
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!performanceData) {
        return null;
    }

    const performanceRating = getPerformanceRating(performanceData.metrics.successRate);

    return (
        <div className="performance-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>📊 My Performance Dashboard</h1>
                    <p>Track your performance metrics and achievements</p>
                </div>
                <div className="last-updated">
                    Last updated: {formatDate(performanceData.calculatedAt)}
                </div>
            </div>

            {/* Overall Performance Score */}
            <div className="performance-score-card">
                <div className="score-main">
                    <div className="score-circle" style={{ borderColor: performanceRating.color }}>
                        <span className="score-value" style={{ color: performanceRating.color }}>
                            {performanceData.metrics.successRate.toFixed(1)}%
                        </span>
                        <span className="score-label">Success Rate</span>
                    </div>
                    <div className="score-info">
                        <div className="rating-badge" style={{ background: performanceRating.color }}>
                            {performanceRating.label}
                        </div>
                        <div className="rating-stars">{performanceRating.icon}</div>
                        <p className="score-description">
                            Based on approved applications out of total applications received
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="metrics-grid">
                {/* Schedules Created */}
                <div className="metric-card">
                    <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        📅
                    </div>
                    <div className="metric-content">
                        <h3>Job Schedules</h3>
                        <div className="metric-stats">
                            <div className="stat-item">
                                <span className="stat-value">{performanceData.schedules.total}</span>
                                <span className="stat-label">Total Created</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value success">{performanceData.schedules.open}</span>
                                <span className="stat-label">Open</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value muted">{performanceData.schedules.closed}</span>
                                <span className="stat-label">Closed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications */}
                <div className="metric-card">
                    <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        📋
                    </div>
                    <div className="metric-content">
                        <h3>Applications</h3>
                        <div className="metric-stats">
                            <div className="stat-item">
                                <span className="stat-value">{performanceData.applications.total}</span>
                                <span className="stat-label">Total Received</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value warning">{performanceData.applications.pending}</span>
                                <span className="stat-label">Pending</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value success">{performanceData.applications.approved}</span>
                                <span className="stat-label">Approved</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invitations */}
                <div className="metric-card">
                    <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        📨
                    </div>
                    <div className="metric-content">
                        <h3>Worker Invitations</h3>
                        <div className="metric-stats">
                            <div className="stat-item">
                                <span className="stat-value">{performanceData.invitations.sent}</span>
                                <span className="stat-label">Sent</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value success">{performanceData.invitations.accepted}</span>
                                <span className="stat-label">Accepted</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value muted">{performanceData.invitations.acceptanceRate.toFixed(1)}%</span>
                                <span className="stat-label">Acceptance Rate</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workers Hired */}
                <div className="metric-card highlight">
                    <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        👷
                    </div>
                    <div className="metric-content">
                        <h3>Workers Hired</h3>
                        <div className="metric-highlight">
                            <span className="highlight-value">{performanceData.metrics.workersHired}</span>
                            <span className="highlight-label">Total Workers Successfully Hired</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Metrics */}
            <div className="additional-metrics">
                <h2>📈 Additional Insights</h2>
                <div className="insights-grid">
                    <div className="insight-card">
                        <div className="insight-icon">🏭</div>
                        <div className="insight-content">
                            <span className="insight-label">Associated Factories</span>
                            <span className="insight-value">{performanceData.metrics.associatedFactories}</span>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">💼</div>
                        <div className="insight-content">
                            <span className="insight-label">Active Jobs</span>
                            <span className="insight-value">{performanceData.metrics.activeJobs}</span>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">⏱️</div>
                        <div className="insight-content">
                            <span className="insight-label">Avg Response Time</span>
                            <span className="insight-value">
                                {performanceData.metrics.avgResponseTimeHours > 0
                                    ? `${performanceData.metrics.avgResponseTimeHours}h`
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">✅</div>
                        <div className="insight-content">
                            <span className="insight-label">Success Rate</span>
                            <span className="insight-value">{performanceData.metrics.successRate.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Breakdown */}
            <div className="performance-breakdown">
                <h2>📊 Performance Breakdown</h2>
                <div className="breakdown-grid">
                    {/* Application Status Breakdown */}
                    <div className="breakdown-card">
                        <h3>Application Processing</h3>
                        <div className="progress-group">
                            <div className="progress-item">
                                <div className="progress-info">
                                    <span>Approved</span>
                                    <span className="progress-value success">
                                        {performanceData.applications.approved} ({performanceData.applications.total > 0
                                            ? ((performanceData.applications.approved / performanceData.applications.total) * 100).toFixed(1)
                                            : 0}%)
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill success"
                                        style={{
                                            width: `${performanceData.applications.total > 0
                                                ? (performanceData.applications.approved / performanceData.applications.total) * 100
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="progress-item">
                                <div className="progress-info">
                                    <span>Pending</span>
                                    <span className="progress-value warning">
                                        {performanceData.applications.pending} ({performanceData.applications.total > 0
                                            ? ((performanceData.applications.pending / performanceData.applications.total) * 100).toFixed(1)
                                            : 0}%)
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill warning"
                                        style={{
                                            width: `${performanceData.applications.total > 0
                                                ? (performanceData.applications.pending / performanceData.applications.total) * 100
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="progress-item">
                                <div className="progress-info">
                                    <span>Rejected</span>
                                    <span className="progress-value danger">
                                        {performanceData.applications.rejected} ({performanceData.applications.total > 0
                                            ? ((performanceData.applications.rejected / performanceData.applications.total) * 100).toFixed(1)
                                            : 0}%)
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill danger"
                                        style={{
                                            width: `${performanceData.applications.total > 0
                                                ? (performanceData.applications.rejected / performanceData.applications.total) * 100
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Status Breakdown */}
                    <div className="breakdown-card">
                        <h3>Schedule Status</h3>
                        <div className="progress-group">
                            <div className="progress-item">
                                <div className="progress-info">
                                    <span>Open Schedules</span>
                                    <span className="progress-value success">
                                        {performanceData.schedules.open} ({performanceData.schedules.total > 0
                                            ? ((performanceData.schedules.open / performanceData.schedules.total) * 100).toFixed(1)
                                            : 0}%)
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill success"
                                        style={{
                                            width: `${performanceData.schedules.total > 0
                                                ? (performanceData.schedules.open / performanceData.schedules.total) * 100
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="progress-item">
                                <div className="progress-info">
                                    <span>Closed Schedules</span>
                                    <span className="progress-value muted">
                                        {performanceData.schedules.closed} ({performanceData.schedules.total > 0
                                            ? ((performanceData.schedules.closed / performanceData.schedules.total) * 100).toFixed(1)
                                            : 0}%)
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill muted"
                                        style={{
                                            width: `${performanceData.schedules.total > 0
                                                ? (performanceData.schedules.closed / performanceData.schedules.total) * 100
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="performance-actions">
                <button className="btn btn-primary" onClick={fetchPerformanceData}>
                    🔄 Refresh Data
                </button>
            </div>
        </div>
    );
};

export default HHMPerformancePage;
