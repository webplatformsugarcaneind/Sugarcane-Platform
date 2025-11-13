import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * FactoryAnalysisPage Component
 * 
 * Factory Profitability Analysis dashboard for farmers to analyze and compare factories
 * based on profitability scores calculated from contract performance data.
 */
const FactoryAnalysisPage = () => {
  const [factories, setFactories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFactoryAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get JWT token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found. Please log in.');
          return;
        }

        console.log('📊 Fetching factory profitability analysis...');

        // Call the analytics API endpoint with better error handling
        const response = await axios.get('/api/analytics/factory-profitability', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });

        console.log('✅ Factory analysis API response:', response.status, response.data);

        if (response.data.success) {
          console.log('✅ Factory analysis data received:', response.data);
          setFactories(response.data.data || []);
          setSummary(response.data.summary || {});
        } else {
          setError(response.data.message || 'Failed to fetch factory analysis');
        }

      } catch (err) {
        console.error('❌ Error fetching factory analysis:', err);
        
        if (err.code === 'ECONNABORTED') {
          setError('Request timeout. Please check if the server is running and try again.');
        } else if (err.response) {
          // Server responded with error
          const status = err.response.status;
          const message = err.response.data?.message || err.response.statusText;
          
          if (status === 401) {
            setError('Authentication failed. Please log in again.');
            // Optionally redirect to login
            // window.location.href = '/login';
          } else if (status === 403) {
            setError('Access denied. This feature is only available for Farmer users.');
          } else if (status === 404) {
            setError('Analytics service not found. Please contact support or try again later.');
          } else {
            setError(`Server error (${status}): ${message}`);
          }
        } else if (err.request) {
          // Network error
          setError('Unable to connect to server. Please check if the backend is running and try again.');
        } else {
          // Other error
          setError(`Unexpected error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFactoryAnalysis();
  }, []);

  // Prepare chart data
  const chartData = {
    labels: factories.map(factory => factory.factoryName || 'Unknown Factory'),
    datasets: [
      {
        label: 'Profitability Score',
        data: factories.map(factory => factory.profitabilityScore || 0),
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',   // Green for top performers
          'rgba(255, 193, 7, 0.8)',   // Amber
          'rgba(33, 150, 243, 0.8)',  // Blue
          'rgba(156, 39, 176, 0.8)',  // Purple
          'rgba(255, 87, 34, 0.8)',   // Deep Orange
          'rgba(96, 125, 139, 0.8)',  // Blue Grey
          'rgba(139, 195, 74, 0.8)',  // Light Green
          'rgba(255, 152, 0, 0.8)',   // Orange
          'rgba(63, 81, 181, 0.8)',   // Indigo
          'rgba(233, 30, 99, 0.8)',   // Pink
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(255, 87, 34, 1)',
          'rgba(96, 125, 139, 1)',
          'rgba(139, 195, 74, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(63, 81, 181, 1)',
          'rgba(233, 30, 99, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '🏭 Factory Profitability Analysis',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const factory = factories[context.dataIndex];
            return [
              `Profitability Score: ${context.parsed.y.toFixed(4)}`,
              `Avg Price: ₹${factory.averagePricePerTon}/ton`,
              `Payment Delay: ${factory.averagePaymentDelay} days`,
              `Fulfillment Rate: ${(factory.contractFulfillmentRate * 100).toFixed(2)}%`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Profitability Score'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Factory Names'
        }
      }
    },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (rate) => {
    return `${((rate || 0) * 100).toFixed(2)}%`;
  };

  const getScoreColor = (score) => {
    if (score >= 100) return '#4caf50'; // Green for excellent
    if (score >= 50) return '#ff9800';  // Orange for good
    if (score >= 10) return '#2196f3';  // Blue for average
    return '#f44336';                   // Red for poor
  };

  const getScoreLabel = (score) => {
    if (score >= 100) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 10) return 'Average';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="factory-analysis-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>🔄 Analyzing factory profitability data...</p>
        </div>
        <style jsx>{`
          .factory-analysis-page {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
          }
          .loading-container {
            text-align: center;
            padding: 4rem 2rem;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #4caf50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="factory-analysis-page">
        <div className="error-container">
          <h2>⚠️ Error Loading Analysis</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            🔄 Retry Analysis
          </button>
        </div>
        <style jsx>{`
          .factory-analysis-page {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
          }
          .error-container {
            text-align: center;
            padding: 4rem 2rem;
            background: #fff5f5;
            border: 2px solid #fed7d7;
            border-radius: 12px;
            margin: 2rem auto;
            max-width: 600px;
          }
          .error-container h2 {
            color: #c53030;
            margin-bottom: 1rem;
          }
          .error-message {
            color: #c53030;
            margin-bottom: 2rem;
            font-size: 1.1rem;
          }
          .retry-button {
            background: #4caf50;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: 600;
          }
          .retry-button:hover {
            background: #45a049;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="factory-analysis-page">
      {/* Header */}
      <div className="page-header">
        <h1>📊 Factory Profitability Analysis</h1>
        <p className="page-subtitle">
          Analyze and compare factories based on profitability scores calculated from contract performance
        </p>
        
        {/* Summary Statistics */}
        {summary && (
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">🏭 Factories Analyzed</span>
              <span className="stat-value">{summary.totalFactoriesAnalyzed || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">📊 Average Score</span>
              <span className="stat-value">{summary.averageScore || '0.00'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">📈 With Contracts</span>
              <span className="stat-value">{summary.factoriesWithContracts || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">📅 Analysis Date</span>
              <span className="stat-value">
                {summary.analysisDate 
                  ? new Date(summary.analysisDate).toLocaleDateString() 
                  : 'Today'
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      {factories.length > 0 && (
        <div className="chart-section">
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Data Table */}
      {factories.length === 0 ? (
        <div className="empty-state">
          <h3>📭 No Factory Data Available</h3>
          <p>No factory profitability data is currently available. This could be because:</p>
          <ul>
            <li>No factories have completed contracts yet</li>
            <li>No contract data is available for analysis</li>
            <li>All factories are new to the platform</li>
          </ul>
        </div>
      ) : (
        <div className="table-section">
          <h2 className="section-title">🏆 Factory Rankings</h2>
          <div className="table-container">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Factory Name</th>
                  <th>Avg. Price (₹/ton)</th>
                  <th>Payment Delay (days)</th>
                  <th>Fulfillment Rate</th>
                  <th>Profitability Score</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {factories.map((factory, index) => (
                  <tr key={factory.factoryId || index} className="factory-row">
                    <td className="rank-cell">
                      <span className="rank-number">#{index + 1}</span>
                      {index === 0 && (
                        <span className="recommended-badge">
                          ⭐ Recommended Factory
                        </span>
                      )}
                    </td>
                    <td className="factory-name">
                      <div>
                        <strong>{factory.factoryName || 'Unknown Factory'}</strong>
                        {factory.factoryLocation && (
                          <div className="factory-location">📍 {factory.factoryLocation}</div>
                        )}
                        <div className="contract-count">
                          📋 {factory.totalContracts} contracts 
                          ({factory.completedContracts} completed)
                        </div>
                      </div>
                    </td>
                    <td className="price-cell">
                      <span className="price-value">
                        {formatCurrency(factory.averagePricePerTon)}
                      </span>
                    </td>
                    <td className="delay-cell">
                      <span className={`delay-value ${factory.averagePaymentDelay > 15 ? 'high-delay' : 'low-delay'}`}>
                        {factory.averagePaymentDelay?.toFixed(1) || 'N/A'} days
                      </span>
                    </td>
                    <td className="fulfillment-cell">
                      <span className="fulfillment-value">
                        {formatPercentage(factory.contractFulfillmentRate)}
                      </span>
                    </td>
                    <td className="score-cell">
                      <span 
                        className="score-value"
                        style={{ color: getScoreColor(factory.profitabilityScore) }}
                      >
                        {factory.profitabilityScore?.toFixed(4) || '0.0000'}
                      </span>
                    </td>
                    <td className="rating-cell">
                      <span 
                        className="rating-label"
                        style={{ 
                          backgroundColor: getScoreColor(factory.profitabilityScore),
                          color: 'white'
                        }}
                      >
                        {getScoreLabel(factory.profitabilityScore)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formula Explanation */}
      <div className="formula-section">
        <h3>📐 Profitability Score Formula</h3>
        <div className="formula-card">
          <div className="formula-text">
            <strong>Score = (Average Price per Ton × Contract Fulfillment Rate) ÷ (Average Payment Delay + 1)</strong>
          </div>
          <div className="formula-explanation">
            <p><strong>Higher scores indicate more profitable partnerships:</strong></p>
            <ul>
              <li><strong>Price per Ton:</strong> Higher contract values increase profitability</li>
              <li><strong>Fulfillment Rate:</strong> Reliability in completing contracts</li>
              <li><strong>Payment Delay:</strong> Faster payments improve cash flow (lower delay is better)</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .factory-analysis-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .page-header h1 {
          color: #2c5530;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #666;
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .stat-item {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #e9ecef;
        }

        .stat-label {
          display: block;
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          display: block;
          color: #2c5530;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .chart-section {
          margin-bottom: 3rem;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .chart-container {
          height: 400px;
          position: relative;
        }

        .table-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .section-title {
          color: #2c5530;
          font-size: 1.5rem;
          padding: 1.5rem 2rem 0;
          margin-bottom: 1rem;
        }

        .table-container {
          overflow-x: auto;
        }

        .analysis-table {
          width: 100%;
          border-collapse: collapse;
        }

        .analysis-table th {
          background: #2c5530;
          color: white;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #4caf50;
        }

        .analysis-table td {
          padding: 1rem;
          border-bottom: 1px solid #e9ecef;
        }

        .factory-row:hover {
          background: #f8f9fa;
        }

        .rank-cell {
          text-align: center;
          min-width: 120px;
        }

        .rank-number {
          font-weight: bold;
          color: #2c5530;
          font-size: 1.1rem;
        }

        .recommended-badge {
          display: block;
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #b8860b;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
          margin-top: 0.5rem;
          box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
        }

        .factory-name {
          min-width: 200px;
        }

        .factory-name strong {
          color: #2c5530;
        }

        .factory-location {
          color: #666;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .contract-count {
          color: #777;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .price-cell {
          text-align: right;
          min-width: 120px;
        }

        .price-value {
          color: #4caf50;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .delay-cell {
          text-align: center;
          min-width: 100px;
        }

        .delay-value {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: bold;
        }

        .low-delay {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .high-delay {
          background: #ffebee;
          color: #c62828;
        }

        .fulfillment-cell {
          text-align: center;
          min-width: 100px;
        }

        .fulfillment-value {
          color: #2c5530;
          font-weight: bold;
        }

        .score-cell {
          text-align: center;
          min-width: 120px;
        }

        .score-value {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .rating-cell {
          text-align: center;
          min-width: 100px;
        }

        .rating-label {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .empty-state h3 {
          color: #666;
          margin-bottom: 1rem;
        }

        .empty-state ul {
          text-align: left;
          max-width: 400px;
          margin: 1rem auto;
        }

        .formula-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .formula-section h3 {
          color: #2c5530;
          margin-bottom: 1rem;
        }

        .formula-card {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .formula-text {
          background: #2c5530;
          color: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 1.1rem;
        }

        .formula-explanation ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .factory-analysis-page {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .summary-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .chart-container {
            height: 300px;
          }

          .analysis-table {
            font-size: 0.9rem;
          }

          .analysis-table th,
          .analysis-table td {
            padding: 0.5rem;
          }

          .recommended-badge {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FactoryAnalysisPage;