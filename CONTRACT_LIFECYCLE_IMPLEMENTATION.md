# Contract Lifecycle Management Implementation

## Overview
This document outlines the implementation of contract lifecycle management features for tracking delivery dates, payment dates, and completion status in both Factory-HHM contracts and Farmer-HHM contracts.

## 📋 Summary of Changes

### 1. Model Updates

#### FarmerContract Model (`backend/models/farmerContract.model.js`)
- **Added Fields:**
  - `delivery_date` (Date, required: false) - When the contract work was delivered
  - `payment_date` (Date, required: false) - When payment was made
  - `payment_status` (String, enum: ['pending', 'paid'], default: 'pending')
- **Updated Status Enum:**
  - Added `'completed'` to status values
  - Status now includes: `['farmer_pending', 'hhm_accepted', 'hhm_rejected', 'auto_cancelled', 'completed']`

#### Contract Model (`backend/models/contract.model.js`)
- **Added Fields:**
  - `delivery_date` (Date, required: false) - When the contract work was delivered
  - `payment_date` (Date, required: false) - When payment was made
  - `payment_status` (String, enum: ['pending', 'paid'], default: 'pending')
- **Updated Status Enum:**
  - Added `'completed'` to status values
  - Status now includes: `['factory_invite', 'hhm_pending', 'factory_offer', 'factory_rejected', 'hhm_accepted', 'hhm_rejected', 'expired', 'cancelled', 'completed']`
- **Updated Virtual Properties:**
  - `isFinalized` virtual now includes 'completed' status

### 2. API Routes Implementation

#### Factory-HHM Contract Routes (`backend/routes/contract.routes.js`)

##### Mark as Delivered
```
PUT /api/contracts/:contractId/mark-delivered
```
- **Access:** Private (HHM or Factory - must be party to contract)
- **Function:** Sets `delivery_date` to current timestamp
- **Validation:** Contract must be in 'hhm_accepted' status
- **Response:** Updated contract object

##### Mark as Paid
```
PUT /api/contracts/:contractId/mark-paid
```
- **Access:** Private (HHM or Factory - must be party to contract)
- **Function:** Sets `payment_date` to current timestamp and `payment_status` to 'paid'
- **Validation:** Contract must be in 'hhm_accepted' status
- **Response:** Updated contract object

##### Mark as Completed
```
PUT /api/contracts/:contractId/mark-completed
```
- **Access:** Private (HHM or Factory - must be party to contract)
- **Function:** Sets `status` to 'completed' and `finalized_at` timestamp
- **Validation:** Contract must have `delivery_date` set
- **Response:** Updated contract object

#### Farmer-HHM Contract Routes (`backend/routes/farmerContract.routes.js`)

##### Mark as Delivered
```
PUT /api/farmer-contracts/:contractId/mark-delivered
```
- **Access:** Private (Farmer or HHM - must be party to contract)
- **Function:** Sets `delivery_date` to current timestamp
- **Validation:** Contract must be in 'hhm_accepted' status
- **Response:** Updated contract object

##### Mark as Paid
```
PUT /api/farmer-contracts/:contractId/mark-paid
```
- **Access:** Private (Farmer or HHM - must be party to contract)
- **Function:** Sets `payment_date` to current timestamp and `payment_status` to 'paid'
- **Validation:** Contract must be in 'hhm_accepted' status
- **Response:** Updated contract object

##### Mark as Completed
```
PUT /api/farmer-contracts/:contractId/mark-completed
```
- **Access:** Private (Farmer or HHM - must be party to contract)
- **Function:** Sets `status` to 'completed'
- **Validation:** Contract must have `delivery_date` set
- **Response:** Updated contract object

### 3. Security & Validation Features

#### Authorization
- All lifecycle endpoints require authentication
- Users must be parties to the contract (validation in each endpoint)
- Role-based access control maintained

#### Data Validation
- Contract must be in 'hhm_accepted' status for delivery/payment operations
- Contract must be delivered before it can be marked as completed
- Proper error handling for invalid contract IDs and unauthorized access

#### Error Handling
- 404 errors for non-existent contracts
- 403 errors for unauthorized access attempts
- 400 errors for invalid operations (e.g., marking non-delivered contract as completed)
- Detailed error messages for debugging

### 4. Testing Implementation

#### Test File: `test-contract-lifecycle-api.js`
- **Coverage:** All three lifecycle endpoints for both contract types
- **Authentication:** Automated login for Factory, HHM, and Farmer roles
- **Error Testing:** Invalid IDs, unauthorized access, validation failures
- **Success Testing:** Complete lifecycle flow from delivery to completion

## 🔧 Frontend Integration Requirements

### UI Components Needed

#### 1. Contract Action Buttons
Add buttons to contract management dashboards for:
- **"Mark as Delivered"** - For HHM/Factory users when work is completed
- **"Mark as Paid"** - For paying party after payment is processed
- **"Mark as Completed"** - Final completion when both delivery and payment are done

#### 2. Status Indicators
Display visual indicators for:
- 🚚 **Delivery Status:** "Pending" | "Delivered on [date]"
- 💰 **Payment Status:** "Pending" | "Paid on [date]"
- ✅ **Overall Status:** Contract progress indicator

#### 3. Contract Timeline View
Optional enhancement showing:
- Contract accepted date
- Delivery date (when set)
- Payment date (when set)
- Completion date (when set)

### Example Frontend API Calls

#### Mark as Delivered
```javascript
const markAsDelivered = async (contractId, contractType = 'contracts') => {
  try {
    const response = await axios.put(
      `/api/${contractType}/${contractId}/mark-delivered`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      // Update UI to show delivery date
      console.log('Contract delivered:', response.data.data.delivery_date);
      // Refresh contract list or update state
    }
  } catch (error) {
    console.error('Error marking as delivered:', error.response?.data?.message);
    // Show error message to user
  }
};
```

#### Mark as Paid
```javascript
const markAsPaid = async (contractId, contractType = 'contracts') => {
  try {
    const response = await axios.put(
      `/api/${contractType}/${contractId}/mark-paid`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      // Update UI to show payment status
      console.log('Payment recorded:', response.data.data.payment_date);
      // Update contract display
    }
  } catch (error) {
    console.error('Error marking as paid:', error.response?.data?.message);
  }
};
```

#### Mark as Completed
```javascript
const markAsCompleted = async (contractId, contractType = 'contracts') => {
  try {
    const response = await axios.put(
      `/api/${contractType}/${contractId}/mark-completed`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      // Update UI to show completed status
      console.log('Contract completed:', response.data.data.status);
      // Move to completed contracts section
    }
  } catch (error) {
    console.error('Error marking as completed:', error.response?.data?.message);
  }
};
```

## 🚀 Next Steps for Implementation

### Immediate Tasks
1. **Frontend Integration:** Add action buttons to existing contract dashboards
2. **API Integration:** Connect frontend buttons to new endpoints
3. **UI Updates:** Display delivery/payment status in contract listings
4. **Testing:** Test the complete flow in development environment

### Optional Enhancements
1. **Notifications:** Send email/app notifications on status changes
2. **Audit Trail:** Log all status changes for compliance
3. **Analytics:** Track delivery times and payment cycles
4. **Automated Workflows:** Auto-complete contracts when both delivery and payment are done

### Database Migration Notes
- These changes are backwards compatible
- Existing contracts will have null delivery_date and payment_date
- Default payment_status is 'pending' for all contracts
- No data migration required

## 📊 Contract Lifecycle Flow

```
Contract Created → Negotiated → Accepted → Delivered → Paid → Completed
      ↓              ↓            ↓          ↓        ↓        ↓
   [status]      [status]    [status]   [delivery] [payment] [status]
  hhm_pending   factory_offer hhm_accepted  _date     _date   completed
```

## 🔗 Related Files Modified

1. **Models:**
   - `backend/models/farmerContract.model.js`
   - `backend/models/contract.model.js`

2. **Routes:**
   - `backend/routes/contract.routes.js`
   - `backend/routes/farmerContract.routes.js`

3. **Testing:**
   - `test-contract-lifecycle-api.js` (newly created)

All changes maintain backwards compatibility and follow existing code patterns for consistency.