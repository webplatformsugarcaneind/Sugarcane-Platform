import React from 'react';
import './OperatingHoursDisplay.css';

/**
 * OperatingHoursDisplay Component
 * 
 * A reusable component for displaying factory operating hours and schedules
 * Supports multiple formats: object with detailed schedule, simple string, or fallback
 */
const OperatingHoursDisplay = ({ 
  operatingHours, 
  compact = false, 
  className = '', 
  factorySession = 'OFF',
  onSessionChange = null,
  canEditSession = false 
}) => {
  // Return null if no operating hours data
  if (!operatingHours) {
    return null;
  }

  // Compact view for directory cards and summaries
  if (compact) {
    if (typeof operatingHours === 'object') {
      const summary = operatingHours.season || 'Contact for details';
      return (
        <span className={`operating-hours-compact ${className}`}>
          {summary}
        </span>
      );
    }
    return (
      <span className={`operating-hours-compact ${className}`}>
        {operatingHours}
      </span>
    );
  }

  // Full detailed view for profile pages
  return (
    <div className={`operating-hours-display ${className}`}>
      {/* Factory Session Status */}
      <div className="factory-session-section">
        <h4 className="session-title">🏭 Factory Session Status</h4>
        <div className="session-controls">
          <div className={`session-indicator ${factorySession === 'ON' ? 'session-active' : 'session-inactive'}`}>
            {factorySession === 'ON' ? '🟢' : '🔴'} Factory {factorySession}
          </div>
          {canEditSession && onSessionChange && (
            <div className="session-buttons">
              <button 
                className={`session-btn ${factorySession === 'ON' ? 'active' : ''}`}
                onClick={() => onSessionChange('ON')}
              >
                ON
              </button>
              <button 
                className={`session-btn ${factorySession === 'OFF' ? 'active' : ''}`}
                onClick={() => onSessionChange('OFF')}
              >
                OFF
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Season Schedule */}
      {operatingHours.season && (
        <div className="schedule-item">
          <span className="schedule-label">🗓️ Season:</span>
          <span className="schedule-value">{operatingHours.season}</span>
        </div>
      )}
      
      {/* Daily Schedule */}
      {operatingHours.daily && (
        <div className="schedule-item">
          <span className="schedule-label">📅 Daily Hours:</span>
          <span className="schedule-value">{operatingHours.daily}</span>
        </div>
      )}



      {/* Shift Information */}
      {(operatingHours.shift1 || operatingHours.shift2) && (
        <div className="schedule-shifts">
          <h4 className="schedule-subtitle">🔄 Shift Schedule</h4>
          <div className="shifts-grid">
            {operatingHours.shift1 && (
              <div className="shift-item">
                <span className="shift-label">First Shift:</span>
                <span className="shift-hours">{operatingHours.shift1}</span>
              </div>
            )}
            {operatingHours.shift2 && (
              <div className="shift-item">
                <span className="shift-label">Second Shift:</span>
                <span className="shift-hours">{operatingHours.shift2}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Maintenance Schedule */}
      {operatingHours.maintenance && (
        <div className="schedule-maintenance">
          <div className="schedule-item">
            <span className="schedule-label">🔧 Maintenance:</span>
            <span className="schedule-value maintenance-info">{operatingHours.maintenance}</span>
          </div>
        </div>
      )}

      {/* Fallback for simple string format */}
      {typeof operatingHours === 'string' && (
        <div className="schedule-item">
          <span className="schedule-label">📅 Hours:</span>
          <span className="schedule-value">{operatingHours}</span>
        </div>
      )}

      {/* Contact Note */}
      <div className="schedule-note">
        <p>💡 <strong>Note:</strong> Hours may vary during peak season or due to maintenance. 
        Contact the factory directly for the most current schedule information.</p>
      </div>
    </div>
  );
};

/**
 * Utility function to format operating hours for display in simple text
 */
export const formatOperatingHoursText = (operatingHours) => {
  if (!operatingHours) return 'Not specified';
  
  if (typeof operatingHours === 'string') {
    return operatingHours;
  }
  
  if (typeof operatingHours === 'object') {
    return operatingHours.season || 'Contact for details';
  }
  
  return 'Contact for details';
};

/**
 * Utility function to check if factory has detailed schedule information
 */
export const hasDetailedSchedule = (operatingHours) => {
  if (!operatingHours || typeof operatingHours === 'string') {
    return false;
  }
  
  return Boolean(operatingHours.season);
};

export default OperatingHoursDisplay;