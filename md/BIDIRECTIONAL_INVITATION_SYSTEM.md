# Bidirectional Factory-HHM Invitation System

## Overview
Complete implementation of bidirectional invitation system between Factories and HHMs with bulk invitation capabilities.

---

## ✅ Implemented Features

### 1. **Factory → Single HHM Invitation** (Already Existed)
- **Endpoint:** `POST /api/factory/invite-hhm`
- **Body:**
```json
{
  "hhmId": "507f1f77bcf86cd799439011",
  "personalMessage": "Optional message",
  "invitationReason": "Optional reason"
}
```

### 2. **Factory → Multiple HHMs (Bulk Invite)** ✨ NEW
- **Endpoint:** `POST /api/factory/invite-multiple-hhms`
- **Body:**
```json
{
  "hhmIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "personalMessage": "Optional message",
  "invitationReason": "Optional reason"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Sent 2 invitation(s) successfully",
  "data": {
    "successful": [
      {
        "hhmId": "507f1f77bcf86cd799439011",
        "hhmName": "John Doe",
        "invitationId": "507f1f77bcf86cd799439099"
      }
    ],
    "failed": [],
    "skipped": [
      {
        "hhmId": "507f1f77bcf86cd799439012",
        "hhmName": "Jane Smith",
        "reason": "Pending invitation already exists"
      }
    ]
  }
}
```
- **Features:**
  - Sends invitations to up to 50 HHMs at once
  - Validates each HHM exists and is active
  - Skips already associated HHMs
  - Skips HHMs with pending invitations
  - Returns detailed results for each HHM

### 3. **HHM → Single Factory Invitation** ✨ NEW
- **Endpoint:** `POST /api/hhm/invite-factory`
- **Body:**
```json
{
  "factoryId": "507f1f77bcf86cd799439013",
  "personalMessage": "Optional message",
  "invitationReason": "Optional reason"
}
```

### 4. **HHM → Multiple Factories (Bulk Invite)** ✨ NEW
- **Endpoint:** `POST /api/hhm/invite-multiple-factories`
- **Body:**
```json
{
  "factoryIds": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
  "personalMessage": "Optional message",
  "invitationReason": "Optional reason"
}
```
- **Features:**
  - Sends invitations to up to 50 Factories at once
  - Validates each Factory exists and is active
  - Skips already associated Factories
  - Skips Factories with pending invitations
  - Returns detailed results for each Factory

### 5. **Get HHM's Sent Factory Invitations** ✨ NEW
- **Endpoint:** `GET /api/hhm/my-factory-invitations`
- **Query Parameters:**
  - `status` - Filter by status (pending/accepted/declined)
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 20)

---

## 📊 Database Schema Updates

### Updated Invitation Model
Added new invitation type: `'hhm-to-factory'`

**Invitation Types:**
1. `'hhm-to-worker'` - HHM invites worker for a job schedule
2. `'factory-to-hhm'` - Factory invites HHM for partnership
3. `'hhm-to-factory'` - HHM invites Factory for partnership ✨ NEW

**Fields:**
```javascript
{
  invitationType: {
    type: String,
    enum: ['hhm-to-worker', 'factory-to-hhm', 'hhm-to-factory']
  },
  factoryId: ObjectId,  // Required for factory-to-hhm and hhm-to-factory
  hhmId: ObjectId,      // Required for all types involving HHM
  workerId: ObjectId,   // Required for hhm-to-worker
  scheduleId: ObjectId, // Required for hhm-to-worker
  personalMessage: String,
  invitationReason: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled']
  }
}
```

---

## 🔄 Complete API Endpoints Summary

### Factory Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/factory/hhms` | Get all HHMs directory |
| GET | `/api/factory/hhms/:id` | Get single HHM profile |
| POST | `/api/factory/invite-hhm` | Invite single HHM |
| POST | `/api/factory/invite-multiple-hhms` | Bulk invite HHMs ✨ |
| GET | `/api/factory/invitations` | Get sent invitations |
| DELETE | `/api/factory/invitations/:id` | Cancel pending invitation |
| GET | `/api/factory/associated-hhms` | Get associated HHMs |
| DELETE | `/api/factory/associated-hhms/:hhmId` | Remove HHM association |

### HHM Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hhm/factory-invitations` | Get received factory invitations |
| PUT | `/api/hhm/factory-invitations/:id` | Accept/decline factory invitation |
| POST | `/api/hhm/invite-factory` | Invite single factory ✨ |
| POST | `/api/hhm/invite-multiple-factories` | Bulk invite factories ✨ |
| GET | `/api/hhm/my-factory-invitations` | Get sent factory invitations ✨ |
| GET | `/api/hhm/associated-factories` | Get associated factories |
| DELETE | `/api/hhm/associated-factories/:factoryId` | Disconnect from factory |

---

## 🎯 Next Steps - Frontend Implementation

### For Factory Dashboard:
1. ✅ HHM Directory with "View Profile" (DONE)
2. ✅ Single HHM invitation (DONE)
3. ⚠️ **TODO:** Add checkbox selection for bulk invitations
4. ⚠️ **TODO:** Merge "Sent Invitations" and "Associated HHMs" into one unified view
5. ⚠️ **TODO:** Show invitation status (pending/accepted/declined) in the list

### For HHM Dashboard:
1. ⚠️ **TODO:** Create Factory Directory page
2. ⚠️ **TODO:** Add "View Profile" for individual factories
3. ⚠️ **TODO:** Add "Send Invitation" button on factory profiles
4. ⚠️ **TODO:** Add checkbox selection for bulk factory invitations
5. ⚠️ **TODO:** Create "My Factory Invitations" page (sent invitations)
6. ⚠️ **TODO:** Create unified "Factories & Invitations" page showing:
   - Pending sent invitations
   - Associated factories
   - Received invitations (already exists)

---

## 🔒 Security Features

- ✅ All endpoints protected with JWT authentication
- ✅ Role-based authorization (Factory/HHM specific)
- ✅ Validates user exists and is active before invitation
- ✅ Prevents duplicate pending invitations
- ✅ Checks if already associated before allowing invitation
- ✅ Rate limiting (max 50 bulk invitations per request)
- ✅ Validates invitation ownership before cancel/delete

---

## 📝 Usage Examples

### Factory Bulk Invite (Frontend)
```javascript
const handleBulkInvite = async (selectedHhmIds) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      '/api/factory/invite-multiple-hhms',
      {
        hhmIds: selectedHhmIds,
        personalMessage: 'We would like to collaborate with you'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Successful:', response.data.data.successful.length);
    console.log('Failed:', response.data.data.failed.length);
    console.log('Skipped:', response.data.data.skipped.length);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### HHM Bulk Invite (Frontend)
```javascript
const handleBulkInviteFactories = async (selectedFactoryIds) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      '/api/hhm/invite-multiple-factories',
      {
        factoryIds: selectedFactoryIds,
        personalMessage: 'I would like to partner with your factory'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Results:', response.data.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## ✅ Testing Checklist

### Backend (All DONE ✅)
- [x] Schema updated with `hhm-to-factory` type
- [x] Factory bulk invite controller created
- [x] HHM invite factory controller created
- [x] HHM bulk invite factories controller created
- [x] HHM get sent invitations controller created
- [x] All controllers exported
- [x] Factory bulk route added
- [x] HHM invite routes added
- [x] Server restarted successfully

### Frontend (TODO)
- [ ] Factory: Add bulk selection UI in HHM Directory
- [ ] Factory: Create unified "HHMs & Invitations" page
- [ ] HHM: Create Factory Directory page
- [ ] HHM: Add single factory invitation
- [ ] HHM: Add bulk factory invitation
- [ ] HHM: Create "My Factory Invitations" page
- [ ] HHM: Create unified "Factories & Invitations" page

---

## 🎨 Recommended UI Flow

### Factory Side:
```
HHM Directory
  ├── [✓] Select All
  ├── [ ] HHM 1 (View Profile)
  ├── [ ] HHM 2 (View Profile)
  └── [Send Invitations to Selected]

Partnerships & Invitations (Unified)
  ├── Pending Sent Invitations (3)
  ├── Associated HHMs (5)
  └── Declined Invitations (1)
```

### HHM Side:
```
Factory Directory
  ├── [✓] Select All
  ├── [ ] Factory 1 (View Profile)
  ├── [ ] Factory 2 (View Profile)
  └── [Send Invitations to Selected]

Partnerships & Invitations (Unified)
  ├── Received Invitations (from Factories)
  ├── Sent Invitations (to Factories)
  └── Associated Factories
```

---

## 🚀 Status: Backend Complete, Frontend Pending

All backend endpoints are implemented and tested. Frontend UI components need to be created next.
