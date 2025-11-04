# Direct Hire Flow - Backend Implementation

## Overview
This document describes the backend implementation for the "Direct Hire" feature that allows HHMs (Hiring and Management) to directly invite workers for their job schedules.

## Features Implemented

### 1. Worker Directory Endpoint (Enhanced)
**Endpoint:** `GET /api/hhm/workers`

**Changes Made:**
- ✅ Fixed role filter from `'Labour'` to `'Worker'` (standardized naming)
- ✅ Added default filter to show only `available` workers
- ✅ Enhanced profile population with complete worker information
- ✅ Added additional fields: `profileId`, `rating`, `completedJobs`

**Query Parameters:**
- `skills` - Filter by skills (comma-separated or array)
- `availabilityStatus` - Filter by availability (default: 'available')
- `location` - Filter by location
- `experience` - Minimum years of experience
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "workerId": "64f...",
      "name": "Amit Kumar",
      "email": "amit.kumar@example.com",
      "phone": "+91...",
      "skills": ["Sugarcane cutting", "Irrigation"],
      "availabilityStatus": "available",
      "location": "Punjab",
      "experience": 2,
      "bio": "Experienced worker...",
      "profileImage": "/uploads/...",
      "joinedDate": "2025-10-01",
      "isVerified": true,
      "profileId": "64f...",
      "rating": 4.5,
      "completedJobs": 12
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "count": 20,
    "totalRecords": 100
  },
  "filters": {
    "skills": ["Harvesting"],
    "availabilityStatus": "available",
    "location": null,
    "experience": null
  }
}
```

**Example Requests:**
```bash
# Get all available workers
GET /api/hhm/workers

# Filter by skills
GET /api/hhm/workers?skills=Harvesting,Planting

# Filter by multiple criteria
GET /api/hhm/workers?skills=Irrigation&availabilityStatus=available&experience=2&page=1&limit=10
```

---

### 2. Create Invitation Endpoint (NEW)
**Endpoint:** `POST /api/hhm/invitations`

**Purpose:** Allow HHMs to directly invite workers to their job schedules

**Authentication:** Protected route - requires HHM role

**Request Body:**
```json
{
  "scheduleId": "64f123456789abcdef123456",  // Required
  "workerId": "64f987654321fedcba654321",    // Required
  "personalMessage": "We would love to have you join our team!", // Optional
  "offeredWage": 550,                         // Optional (defaults to schedule wage)
  "priority": "high"                          // Optional: 'low' | 'medium' | 'high' | 'urgent'
}
```

**Validation Checks:**
1. ✅ `scheduleId` is required
2. ✅ `workerId` is required
3. ✅ Schedule must exist and belong to the HHM
4. ✅ Schedule must be in 'open' status
5. ✅ Worker must exist with 'Worker' role
6. ✅ Worker must have a completed profile
7. ✅ Worker must be 'available'
8. ✅ No duplicate invitation for same worker-schedule pair
9. ✅ Worker hasn't already applied for this schedule

**Success Response (201):**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": {
    "invitationId": "6909b76711d3a1fd78ccda45",
    "worker": {
      "id": "690996166cadee4d0ddcb3c0",
      "name": "Meena Kumari",
      "email": "meena.kumari@example.com",
      "phone": "+91..."
    },
    "schedule": {
      "id": "6909b76711d3a1fd78ccda42",
      "title": "Test Direct Hire Schedule",
      "startDate": "2025-11-11",
      "endDate": "2025-11-18",
      "location": "Test Location",
      "wageOffered": 500
    },
    "status": "pending",
    "offeredWage": 550,
    "priority": "high",
    "personalMessage": "We would love...",
    "expiresAt": "2025-11-11T10:00:00Z",
    "createdAt": "2025-11-04T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Message | Reason |
|--------|---------|--------|
| 400 | "Schedule ID is required" | Missing scheduleId |
| 400 | "Worker ID is required" | Missing workerId |
| 404 | "Schedule not found or you do not have permission..." | Invalid schedule or not owned by HHM |
| 400 | "Cannot send invitations for closed schedules" | Schedule status is not 'open' |
| 404 | "Worker not found or invalid worker ID" | Worker doesn't exist or not a Worker role |
| 400 | "Worker does not have a profile..." | Worker hasn't completed profile |
| 400 | "Worker is currently unavailable..." | Worker's availabilityStatus is not 'available' |
| 400 | "An invitation has already been sent..." | Duplicate invitation |
| 400 | "This worker has already applied..." | Worker already applied for this schedule |
| 500 | "Error creating invitation" | Server error |

**Example Requests:**
```bash
# Basic invitation
curl -X POST http://localhost:5000/api/hhm/invitations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": "6909b76711d3a1fd78ccda42",
    "workerId": "690996166cadee4d0ddcb3c0"
  }'

# Invitation with custom wage and message
curl -X POST http://localhost:5000/api/hhm/invitations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": "6909b76711d3a1fd78ccda42",
    "workerId": "690996166cadee4d0ddcb3c0",
    "personalMessage": "Your skills match perfectly for this job!",
    "offeredWage": 600,
    "priority": "urgent"
  }'
```

---

## File Changes

### Modified Files

#### 1. `backend/controllers/hhm.controller.js`
- **Added:** `const Invitation = require('../models/invitation.model');`
- **Modified:** `getWorkers()` function
  - Changed role filter from `'Labour'` to `'Worker'`
  - Added default `availabilityStatus: 'available'` filter
  - Enhanced response with additional profile fields
- **Added:** `createInvitation()` function (new function)
- **Modified:** `module.exports` to include `createInvitation`

#### 2. `backend/routes/hhm.routes.js`
- **Added:** Import `createInvitation` from controller
- **Added:** New route section "INVITATION MANAGEMENT ROUTES (DIRECT HIRE)"
- **Added:** `POST /invitations` route with full documentation

#### 3. `backend/test-direct-hire.js` (NEW)
- Test script to verify the Direct Hire flow
- Creates test data if needed
- Demonstrates API usage

---

## Database Schema

### Invitation Model
Already exists at `backend/models/invitation.model.js`

**Key Fields:**
- `workerId` - Reference to User (Worker)
- `hhmId` - Reference to User (HHM)
- `scheduleId` - Reference to Schedule
- `status` - Enum: 'pending', 'accepted', 'declined'
- `personalMessage` - Optional message from HHM
- `offeredWage` - Custom wage offer
- `priority` - Enum: 'low', 'medium', 'high', 'urgent'
- `expiresAt` - Auto-set to 7 days from creation
- `respondedAt` - Timestamp when worker responds
- `responseMessage` - Worker's response message

**Indexes:**
- Compound unique index: `{ workerId, scheduleId }` - Prevents duplicates
- `{ hhmId, status }`
- `{ scheduleId, status }`
- `{ status, createdAt }`

**Automatic Features:**
- Auto-expires in 7 days
- Auto-creates Application when accepted
- Auto-updates Schedule accepted worker count

---

## Testing

### Run Test Script
```bash
cd backend
node test-direct-hire.js
```

### Expected Output
✅ Connects to MongoDB  
✅ Finds HHM user  
✅ Lists workers with profiles  
✅ Creates/finds open schedule  
✅ Creates invitation successfully  
✅ Shows all invitations for HHM  
✅ Displays example API usage  

---

## Integration with Frontend

### Worker Directory Page (HHM)
```javascript
// Fetch available workers
const response = await axios.get('/api/hhm/workers', {
  params: {
    skills: 'Harvesting,Planting',
    availabilityStatus: 'available',
    page: 1,
    limit: 20
  },
  headers: { Authorization: `Bearer ${token}` }
});

const workers = response.data.data;
```

### Send Invitation
```javascript
// Send invitation to worker
const sendInvitation = async (scheduleId, workerId) => {
  try {
    const response = await axios.post('/api/hhm/invitations', {
      scheduleId,
      workerId,
      personalMessage: 'We would love to have you join our team!',
      offeredWage: 600,
      priority: 'high'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Invitation sent:', response.data);
    alert('Invitation sent successfully!');
  } catch (error) {
    console.error('Error:', error.response?.data);
    alert(error.response?.data?.message || 'Failed to send invitation');
  }
};
```

---

## Security Features

1. ✅ **Authentication Required** - All routes protected with JWT
2. ✅ **Role Authorization** - Only HHM users can access
3. ✅ **Ownership Verification** - HHM can only invite for their own schedules
4. ✅ **Duplicate Prevention** - Unique constraint on worker-schedule pairs
5. ✅ **Status Validation** - Only open schedules, available workers
6. ✅ **Profile Validation** - Workers must have completed profiles

---

## Next Steps (Future Enhancements)

1. **Worker Invitation Management:**
   - `GET /api/worker/invitations` - View received invitations
   - `PUT /api/worker/invitations/:id/accept` - Accept invitation
   - `PUT /api/worker/invitations/:id/decline` - Decline invitation

2. **HHM Invitation Tracking:**
   - `GET /api/hhm/invitations` - View sent invitations
   - `GET /api/hhm/invitations/:id` - View specific invitation
   - `DELETE /api/hhm/invitations/:id` - Cancel invitation

3. **Notifications:**
   - Email/SMS notifications when invitation sent
   - Reminders for pending invitations
   - Notifications on acceptance/decline

4. **Analytics:**
   - Invitation acceptance rates
   - Response time tracking
   - Most hired workers statistics

---

## Summary

✅ **Worker Directory Endpoint** - Fixed and enhanced  
✅ **Create Invitation Endpoint** - Fully implemented  
✅ **Comprehensive Validation** - 9 validation checks  
✅ **Full Documentation** - API docs, examples, schemas  
✅ **Test Script** - Automated testing  
✅ **Security** - Authentication, authorization, ownership checks  

The Direct Hire flow is now fully functional and ready for frontend integration! 🎉
