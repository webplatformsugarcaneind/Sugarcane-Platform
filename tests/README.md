# Test Organization

This directory contains all test files for the Sugarcane Platform project.

## Directory Structure

### `/auth`
Authentication and authorization tests:
- `test-login.js` - Login functionality tests

### `/profiles`
User profile tests:
- `test-enhanced-factory-profile.js` - Enhanced factory profile tests
- `test-factory-profile.js` - Basic factory profile tests
- `test-hhm-profile.js` - HHM profile tests
- `test-labour-profile.js` - Labour/Worker profile tests

### `/integration`
Backend integration and API tests:
- `test-approve-applications.js` - Application approval workflow
- `test-auth.js` - Backend authentication tests
- `test-backend-simple.js` - Basic backend functionality
- `test-complete-data.js` - Complete data validation
- `test-data-integrity.js` - Data integrity checks
- `test-direct-hire.js` - Direct hire feature tests
- `test-enhanced-factory-profile.js` - Factory profile API tests
- `test-farmer-api.js` - Farmer API endpoints
- `test-farmer-profile.js` - Farmer profile tests
- `test-farmer-profile-final.js` - Final farmer profile tests
- `test-farmer-update.js` - Farmer update operations
- `test-hhm-dashboard.js` - HHM dashboard functionality
- `test-hhm-mapping.js` - HHM mapping tests
- `test-hhm-profile.js` - HHM profile API tests
- `test-hhm-profiles.js` - Multiple HHM profiles
- `test-labour-profile.js` - Labour profile API tests
- `test-labour-profile-live.js` - Live labour profile tests
- `test-profile-mapping.js` - Profile mapping tests
- `test-profile-update.js` - Profile update operations
- `test-public-factories.js` - Public factory endpoints
- `test-quick-profiles.js` - Quick profile tests
- `test-updated-profile-forms.js` - Updated profile forms
- `test-user-creation.js` - User creation tests
- `test-worker-profile.js` - Worker profile tests

## Running Tests

```bash
# Run all tests
npm test

# Run specific test category
node tests/auth/test-login.js
node tests/profiles/test-factory-profile.js
node tests/integration/test-farmer-api.js
```

## Notes

- All test files follow the naming convention: `test-*.js`
- Integration tests may require the backend server to be running
- Some tests may require specific test data or database setup
