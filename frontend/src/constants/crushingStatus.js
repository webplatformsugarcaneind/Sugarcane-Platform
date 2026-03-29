// Crushing Status Constants
// These constants define the valid crushing status values and their display properties

export const CRUSHING_STATUS = {
  ON: 'ON',
  OFF: 'OFF'
};

export const CRUSHING_STATUS_DISPLAY = {
  [CRUSHING_STATUS.ON]: {
    label: 'Crushing ON',
    icon: '🟢',
    color: '#27ae60',
    bgColor: 'linear-gradient(135deg, #27ae60, #2ecc71)',
    description: 'Factory is currently processing sugarcane'
  },
  [CRUSHING_STATUS.OFF]: {
    label: 'Crushing OFF', 
    icon: '🔴',
    color: '#e74c3c',
    bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    description: 'Factory is not currently processing sugarcane'
  }
};

export const DEFAULT_CRUSHING_STATUS = CRUSHING_STATUS.OFF;

// Helper functions
export const getCrushingStatusDisplay = (status) => {
  return CRUSHING_STATUS_DISPLAY[status] || CRUSHING_STATUS_DISPLAY[DEFAULT_CRUSHING_STATUS];
};

export const isValidCrushingStatus = (status) => {
  return Object.values(CRUSHING_STATUS).includes(status);
};