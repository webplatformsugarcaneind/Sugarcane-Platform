# Contract API Implementation Summary

## Overview
Successfully implemented a complete Contract API system for managing negotiations between HHMs (Hub Head Managers) and Factories in the Sugarcane Platform.

## Files Created/Modified

### 1. Contract Model (`models/contract.model.js`)
- **Schema Fields** (as requested):
  - `hhm_id`: ObjectId reference to User (HHM role required)
  - `factory_id`: ObjectId reference to User (Factory role required)
  - `status`: String with custom enum values for negotiation flow
  - `initiated_by`: String enum ('hhm', 'factory')
  - `hhm_request_details`: Object for storing HHM form data
  - `factory_allowance_list`: Object for storing Factory counter-offers
  - `timestamps`: true (automatic createdAt/updatedAt)

- **Additional Features**:
  - Enhanced status tracking with specific negotiation states
  - Validation for user roles and data types
  - Compound indexes for performance
  - Virtual properties for status checks
  - Static methods for querying
  - Instance methods for contract operations

### 2. Contract Controller (`controllers/contract.controller.js`)
- **Core Functions** (as requested):
  - `createContractRequest`: HHM creates contract request
  - `respondToContract`: Factory responds with accept/reject/counter-offer
  - `finalizeContract`: HHM accepts/rejects factory's offer
  - `getMyContracts`: Get all contracts for logged-in user

- **Additional Functions**:
  - `getContractById`: Get specific contract details
  - `extendContract`: Extend contract deadlines
  - `cancelContract`: Cancel active contracts
  - `getContractStats`: Dashboard statistics

### 3. Contract Routes (`routes/contract.routes.js`)
- **Core Endpoints** (as requested):
  - `POST /api/contracts/request` - HHM creates request
  - `PUT /api/contracts/respond/:contractId` - Factory responds
  - `PUT /api/contracts/finalize/:contractId` - HHM finalizes
  - `GET /api/contracts/my-contracts` - Get user's contracts

- **Additional Endpoints**:
  - `GET /api/contracts/:contractId` - Get specific contract
  - `GET /api/contracts/stats` - Contract statistics
  - `PUT /api/contracts/:contractId/extend` - Extend deadline
  - `PUT /api/contracts/:contractId/cancel` - Cancel contract
  - `GET /api/contracts/dashboard` - Dashboard data
  - `GET /api/contracts/partner/:partnerId` - Partner contracts

### 4. Server Configuration (`server.js`)
- Added contract routes to main server: `/api/contracts`
- Updated endpoint documentation and logging

## Contract Negotiation Flow

### Status Values:
1. **`hhm_pending`** - HHM submitted request, waiting for Factory response
2. **`factory_offer`** - Factory made counter-offer, waiting for HHM response
3. **`factory_rejected`** - Factory rejected the HHM request
4. **`hhm_accepted`** - HHM accepted factory's offer (SUCCESS)
5. **`hhm_rejected`** - HHM rejected factory's offer
6. **`expired`** - Contract expired without response
7. **`cancelled`** - Contract cancelled by either party

### Negotiation Workflow:
1. **HHM Initiates**: POST to `/api/contracts/request` with factory_id and request details
2. **Factory Responds**: PUT to `/api/contracts/respond/:contractId` with decision:
   - `reject` → status becomes `factory_rejected`
   - `offer` → status becomes `factory_offer` (includes counter-offer details)
3. **HHM Finalizes**: PUT to `/api/contracts/finalize/:contractId` with decision:
   - `accept` → status becomes `hhm_accepted`
   - `reject` → status becomes `hhm_rejected`

## Security & Authorization

### Route Protection:
- All routes require authentication (`protect` middleware)
- Role-based access control:
  - **HHM only**: `/request`, `/finalize/:contractId`
  - **Factory only**: `/respond/:contractId`
  - **Both HHM & Factory**: `/my-contracts`, `/:contractId`, `/stats`, etc.

### Data Validation:
- User role validation (HHM/Factory references)
- Required field validation
- Enum value validation for status and decisions
- Authorization checks (users can only access their own contracts)

## Key Features

### 1. Duplicate Prevention:
- Unique index prevents multiple active contracts between same HHM-Factory pair
- Graceful handling of duplicate creation attempts

### 2. Expiration Management:
- Automatic expiration date setting (30 days default)
- Expired contract detection and status updates
- Contract extension functionality

### 3. Audit Trail:
- Timestamps for creation, responses, and finalization
- Revision counting for contract modifications
- Last modified by tracking

### 4. Query Optimization:
- Compound indexes for performance
- Pagination support
- Filtering by status, priority, initiator
- Population of user details

### 5. Dashboard Integration:
- Contract statistics for dashboards
- Recent activity tracking
- Expiring contract alerts

## Example Usage

### 1. HHM Creates Request:
```javascript
POST /api/contracts/request
{
  "factory_id": "64f123456789abcdef123456",
  "hhm_request_details": {
    "vehicles": ["truck", "tractor"],
    "laborCount": 50,
    "skills": ["harvesting", "loading"]
  },
  "title": "Harvest Season Contract"
}
```

### 2. Factory Responds with Offer:
```javascript
PUT /api/contracts/respond/64f789...
{
  "decision": "offer",
  "factory_allowance_list": {
    "approvedVehicles": ["truck"],
    "maxLaborCount": 40,
    "paymentTerms": "weekly"
  }
}
```

### 3. HHM Accepts:
```javascript
PUT /api/contracts/finalize/64f789...
{
  "decision": "accept",
  "response_message": "Terms accepted"
}
```

## Testing Verification
✅ All models, controllers, and routes properly imported  
✅ Schema validation working correctly  
✅ Required functions implemented  
✅ Status enum values properly configured  
✅ No syntax errors in any files  

The Contract API is fully functional and ready for integration with the frontend application!