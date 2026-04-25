# Crushing Status Feature - Manual Testing Checklist

## Pre-Testing Setup
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5174 (or other available port)
- [ ] Test factory user account created
- [ ] MongoDB database connected

## Backend API Testing

### Authentication Required Tests (Factory Owner)
- [ ] **GET /api/factory/crushing-status**
  - [ ] Returns current crushing status
  - [ ] Response format: `{ success: true, data: { crushingStatus: "OFF" } }`
  - [ ] Status 200 for authenticated factory user
  - [ ] Status 401 for unauthenticated request
  - [ ] Status 403 for non-factory user

- [ ] **PUT /api/factory/crushing-status**
  - [ ] Accepts valid status: "ON"
  - [ ] Accepts valid status: "OFF"
  - [ ] Rejects invalid status: "INVALID" (Status 400)
  - [ ] Updates database successfully
  - [ ] Returns updated data with timestamp
  - [ ] Status 401 for unauthenticated request
  - [ ] Status 403 for non-factory user

### Public API Testing
- [ ] **GET /api/public/factories**
  - [ ] Includes `crushingStatus` field in factory listings
  - [ ] Shows default "OFF" for factories without explicit status

- [ ] **GET /api/public/factories/:id**
  - [ ] Includes `crushingStatus` field in single factory response
  - [ ] Reflects current status from database

## Frontend UI Testing

### Factory Dashboard Page (`/factory/dashboard`)
- [ ] **Crushing Status Section Visibility**
  - [ ] Section appears in welcome area
  - [ ] Title: "Sugarcane Crushing Status"
  - [ ] Status loads on page load
  - [ ] Loading indicator shows during fetch

- [ ] **Status Control Interface**
  - [ ] Dropdown shows current status
  - [ ] Dropdown options: "ON", "OFF"
  - [ ] Visual indicator shows correct color (🟢 for ON, 🔴 for OFF)
  - [ ] Status text matches selection

- [ ] **Status Update Functionality**
  - [ ] Can change from OFF to ON
  - [ ] Can change from ON to OFF
  - [ ] "Updating..." indicator shows during API call
  - [ ] Success message appears after update
  - [ ] Status indicator updates immediately
  - [ ] Error handling for network issues

### Factory Profile View Page (`/factory-profile/:id`)
- [ ] **Badge Display**
  - [ ] Crushing status badge appears in header
  - [ ] Correct color coding (green for ON, red for OFF)
  - [ ] Correct emoji and text display

- [ ] **Information Section**
  - [ ] Crushing status appears in factory information
  - [ ] Status formatting: "🟢 ACTIVE" or "🔴 INACTIVE"
  - [ ] Read-only display (no edit controls)

### Factory Directory Page (`/factories`)
- [ ] **Card Header Badge**
  - [ ] Mini crushing status badge appears
  - [ ] Correct color and emoji
  - [ ] Badge size appropriate for card layout

- [ ] **Statistics Section**
  - [ ] Crushing status appears in stats
  - [ ] Consistent color coding
  - [ ] Status text: "ACTIVE" or "INACTIVE"

## Cross-Browser Testing
- [ ] **Chrome/Edge**
  - [ ] All functionality works
  - [ ] Styles render correctly
  - [ ] Animations smooth

- [ ] **Firefox**
  - [ ] All functionality works
  - [ ] Styles render correctly

- [ ] **Mobile Chrome (Responsive)**
  - [ ] Dashboard status section scales properly
  - [ ] Badges remain readable
  - [ ] Dropdown still functional

## Error Handling Testing
- [ ] **Network Errors**
  - [ ] Graceful handling of API failures
  - [ ] Error messages display to user
  - [ ] UI remains functional after errors

- [ ] **Invalid Data**
  - [ ] Backend validates crushing status values
  - [ ] Frontend prevents invalid submissions
  - [ ] Clear error messages for validation failures

- [ ] **Permission Errors**
  - [ ] Non-factory users cannot access update endpoints
  - [ ] Appropriate error messages shown
  - [ ] UI gracefully handles permission denials

## Data Persistence Testing
- [ ] **Database Updates**
  - [ ] Status changes persist after page refresh
  - [ ] Status visible in other parts of application
  - [ ] Multiple factory accounts can have different statuses

- [ ] **Default Values**
  - [ ] New factories default to "OFF" status
  - [ ] Existing factories without status default to "OFF"
  - [ ] No breaking changes to existing data

## Performance Testing
- [ ] **Load Times**
  - [ ] Status loads quickly on dashboard
  - [ ] No noticeable delay in factory listings
  - [ ] Status updates respond quickly

- [ ] **Concurrent Updates**
  - [ ] Multiple status changes handle gracefully
  - [ ] No race conditions in UI updates

## Security Testing
- [ ] **Authorization**
  - [ ] Only factory owners can update their status
  - [ ] Cannot update other factories' status
  - [ ] JWT token validation working

- [ ] **Input Validation**
  - [ ] SQL injection prevention (enum validation)
  - [ ] XSS prevention in status display
  - [ ] CSRF protection on update endpoints

## Integration Testing
- [ ] **End-to-End Flow**
  - [ ] Factory owner logs in
  - [ ] Views current status on dashboard
  - [ ] Updates status to ON
  - [ ] Status reflects in profile view
  - [ ] Status shows in directory listing
  - [ ] Other users see updated status

- [ ] **Multi-User Scenarios**
  - [ ] Multiple factories can have different statuses
  - [ ] Status changes don't affect other factories
  - [ ] Public users see all factory statuses correctly

## Accessibility Testing
- [ ] **Screen Readers**
  - [ ] Status information announced clearly
  - [ ] Dropdown properly labeled
  - [ ] Color coding supplemented with text/icons

- [ ] **Keyboard Navigation**
  - [ ] Can navigate to status controls via keyboard
  - [ ] Dropdown operable with keyboard
  - [ ] Focus indicators visible

## Final Verification
- [ ] **Code Quality**
  - [ ] No console errors in browser
  - [ ] No warning messages in server logs
  - [ ] Code follows existing patterns
  - [ ] Constants used instead of hardcoded strings

- [ ] **Documentation**
  - [ ] API endpoints documented
  - [ ] Implementation details recorded
  - [ ] Testing results documented

---

**Testing Completed By:** ________________  
**Date:** ________________  
**Overall Status:** ⚠️ Pending / ✅ Passed / ❌ Failed  
**Notes:** ________________