# Sugarcane Platform

A full-stack web platform connecting Farmers, Hub Head Managers (HHMs), Workers, and Factories in the sugarcane ecosystem.

This repository contains:

- React + Vite frontend
- Express + MongoDB backend
- Role-based workflows for listings, hiring, invitations, contracts, orders, billing, and analytics

## Table of Contents

- [Current Status](#current-status)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Run the Application](#run-the-application)
- [API Surface (Current)](#api-surface-current)
- [Testing (Current)](#testing-current)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Current Status

Last updated: 2026-04-26

This README reflects the current codebase in this repository (routes, scripts, and deployment files). Some older docs in `md/` may describe earlier states.

## Features

### User Roles

- Farmer
  - Manage profile
  - Create and manage crop listings
  - Browse HHMs and factories
- HHM (Hub Head Manager)
  - Manage profile and schedules
  - Review worker applications
  - Invite workers and factories
- Worker
  - Manage profile
  - Browse jobs/schedules
  - Apply to opportunities
  - Respond to invitations
- Factory
  - Manage profile
  - Handle bills and maintenance jobs
  - Invite/associate HHMs
  - View analytics

### Core Functional Areas

- JWT authentication and role-based access
- User profile workflows
- Crop listing and order workflows
- HHM-worker hiring/invitation flow
- Factory-HHM partnership flow
- Contract APIs (standard + farmer contracts)
- Factory analytics endpoints

## Tech Stack

### Backend

- Node.js
- Express 5 (`express@5.x`)
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)

### Frontend

- React 19
- Vite 7
- Tailwind CSS 4
- React Router DOM 7
- Axios

## Project Structure

```text
SugarCane/
|- backend/
|  |- config/
|  |- controllers/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- test_scripts/
|  |- server.js
|  |- package.json
|  |- render.yaml
|- frontend/
|  |- public/
|  |- src/
|  |- package.json
|  |- vite.config.js
|  |- netlify.toml
|- md/
|- test/
|- README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB local installation or MongoDB Atlas
- Git

## Local Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

1. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

1. Create backend environment file:

```bash
cd ../backend
# create backend/.env manually
```

1. Configure environment variables (see next section).

2. Start MongoDB (if using local MongoDB):

```bash
# Windows service
net start MongoDB

# OR manual startup
mongod --dbpath "D:\\data\\db"
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/sugarcane-platform
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRE=30d

# Optional for hosted use
CORS_ORIGIN=http://localhost:5173
```

Notes:

- There is no tracked `.env.example` in this repository right now.
- `MONGO_URI` is required for normal backend data operations.

## Run the Application

Use two terminals from the project root.

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`

### Production-style run (local)

```bash
cd frontend
npm run build

cd ../backend
npm start
```

## API Surface (Current)

Current route groups registered in `backend/server.js`:

- `GET /`
- `GET /api/health`
- `/api/auth`
- `/api/public`
- `/api/users`
- `/api/farmer`
- `/api/hhm`
- `/api/worker`
- `/api/factory`
- `/api/contracts`
- `/api/farmer-contracts`
- `/api/analytics`
- `/api/orders`
- `/api/listings`

Additional test/debug route groups are also mounted:

- `/api/test-raw`
- `/api/test-orders`
- `/api/minimal-test`

Important:

- Swagger/OpenAPI docs are not currently configured in `backend/server.js`.
- Older references to `/api-docs` are outdated for this repo state.

## Testing (Current)

Current testing is script-based/manual rather than a fully integrated test runner.

Backend:

- `npm test` currently points to a placeholder script.
- Use targeted scripts from:
  - `backend/test_scripts/`
  - `test/`

Examples:

```bash
cd backend
node test_scripts/test-auth-flow.js
node test_scripts/test-endpoints.js
```

Frontend:

- No `npm test` script is currently defined in `frontend/package.json`.
- Use lint/build checks:

```bash
cd frontend
npm run lint
npm run build
```

## Deployment

### Backend (Render)

`backend/render.yaml` is included and configured for a Node web service with:

- `buildCommand: npm install`
- `startCommand: npm start`
- `healthCheckPath: /api/health`

Expected env vars include:

- `NODE_ENV`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`

### Frontend (Netlify)

`frontend/netlify.toml` is included with:

- SPA redirect to `index.html`
- Build command `npm run build`
- Publish directory `dist`

## Troubleshooting

- Backend starts but DB connection fails:
  - Check `MONGO_URI`
  - Ensure MongoDB is running
  - Verify network/Atlas IP access
- CORS issues in browser:
  - Confirm frontend URL and backend CORS config in `backend/server.js`
- `start-server.bat` and `start-frontend.bat`:
  - These contain machine-specific absolute paths and may not work on other systems
  - Prefer npm scripts (`npm run dev`, `npm start`)

## License

ISC

## API Appendix

The following paths are taken from currently mounted route files and grouped by feature area.

### Auth API

Base: /api/auth

- POST /register
- POST /login
- GET /verify

### Public API

Base: /api/public

- GET /factories
- GET /factories/:id
- GET /roles-features
- GET /roles-features/:roleName
- GET /farmers/:id

### User Utility API

Base: /api/users

- GET /profile/:userId
- GET /search

### Farmer API

Base: /api/farmer

- GET /profile
- GET /test-profile
- PUT /profile
- GET /announcements
- POST /listings
- GET /listings
- GET /listings/my
- PUT /listings/:id
- DELETE /listings/:id
- GET /hhms
- GET /hhms/:id
- GET /factories
- GET /factories/:factoryId
- POST /factories/:factoryId/associate-hhms
- DELETE /factories/:factoryId/remove-hhm/:hhmId

### HHM API

Base: /api/hhm

- GET /profile
- PUT /profile
- POST /schedules
- GET /schedules
- GET /schedules/:id
- PUT /schedules/:id
- DELETE /schedules/:id
- GET /workers
- PUT /workers/:workerId/availability
- POST /release-worker
- POST /invitations
- GET /applications
- PUT /applications/:id
- GET /dashboard
- GET /schedules/:id/applications
- GET /factory-invitations
- PUT /factory-invitations/:id
- POST /invite-factory
- POST /invite-multiple-factories
- GET /my-factory-invitations
- GET /associated-factories
- DELETE /associated-factories/:factoryId
- GET /my-performance
- GET /farmers
- GET /farmer/:id

### Worker API

Base: /api/worker

- GET /profile
- PUT /profile
- PUT /availability
- GET /hhms
- GET /jobs
- POST /applications
- GET /applications
- GET /invitations
- PUT /invitations/:id
- GET /dashboard
- GET /jobs/:id
- DELETE /applications/:id
- GET /jobs/recommendations

### Factory API

Base: /api/factory

- GET /dashboard-stats
- GET /profile
- PUT /profile
- POST /bills
- GET /bills
- POST /maintenance-jobs
- GET /maintenance-applications
- PUT /maintenance-applications/:id
- GET /hhms
- GET /hhms/:id
- POST /invite-hhm
- POST /invite-multiple-hhms
- GET /invitations
- GET /received-invitations
- PUT /received-invitations/:id
- GET /associated-hhms
- DELETE /invitations/:id
- DELETE /associated-hhms/:hhmId
- DELETE /notifications/:id
- DELETE /notifications
- GET /crushing-status
- PUT /crushing-status

### Contract API

Base: /api/contracts

- POST /request
- POST /invite
- PUT /:contractId/accept-invite
- PUT /:contractId/reject-invite
- PUT /respond/:contractId
- PUT /finalize/:contractId
- GET /my-contracts
- GET /:contractId
- GET /stats
- PUT /:contractId/extend
- PUT /:contractId/cancel
- PUT /:contractId/mark-delivered
- PUT /:contractId/mark-paid
- PUT /:contractId/mark-completed
- GET /dashboard
- GET /partner/:partnerId

### Farmer Contract API

Base: /api/farmer-contracts

- POST /request
- GET /my-contracts
- PUT /respond/:contractId
- PUT /:contractId/mark-delivered
- PUT /:contractId/mark-paid
- PUT /:contractId/mark-completed

### Listings API

Base: /api/listings

- GET /marketplace
- GET /test
- POST /create-test
- POST /create
- PUT /:id
- DELETE /:id
- GET /my-listings
- GET /:id

### Orders API

Base: /api/orders

- POST /create
- GET /received
- GET /sent
- GET /listing/:listingId
- PUT /:orderId/status
- GET /my-orders

### Analytics API

Base: /api/analytics

The currently mounted file is analytics-stable.routes.js and includes:

- GET /test
- GET /factory-profitability

Other analytics route files exist with additional endpoints, but they are not all mounted simultaneously in server.js.

### Test and Debug APIs

- Base /api/test-raw
  - GET /raw/:userId
- Base /api/test-orders
  - GET /:orderId/test
- Base /api/minimal-test
  - PUT /:orderId/minimal-status

## Script Reference

### Backend scripts

From backend/package.json:

- npm start
  - Starts production server using node server.js
- npm run dev
  - Starts dev server using nodemon server.js
- npm test
  - Placeholder script (currently exits with error)
- npm run data:import
  - Runs node seeder (note: seeder path should be verified before use)
- npm run data:destroy
  - Runs node seeder -d (script currently contains unusual whitespace and may need cleanup)

### Frontend scripts

From frontend/package.json:

- npm run dev
  - Starts Vite dev server
- npm run build
  - Builds production assets
- npm run lint
  - Runs ESLint
- npm run preview
  - Serves built assets locally

## Frontend-Backend Integration Notes

The frontend Vite config proxies /api to the backend:

- proxy target: <http://localhost:5000>
- changeOrigin: true
- secure: false

This allows frontend API calls to use relative paths like /api/auth/login during development.

## CORS and Client Origins

The backend currently allows these origins:

- <http://localhost:5173>
- <http://localhost:5174>
- <http://localhost:3000>

If your frontend runs on a different port or domain, update backend/server.js accordingly.

## Data and Media Notes

- The backend serves uploads as static files from /uploads.
- Listing creation and update routes support multipart upload for farm_images.
- Ensure write permissions for uploads directory in your deployment environment.

## Logging and Error Handling Behavior

- Request logging is enabled in backend/server.js.
- Global error middleware returns JSON responses.
- There are process-level handlers for uncaughtException and unhandledRejection.

Important note:

- The file currently contains duplicated process-level handlers with different shutdown behavior.
- Consider consolidating them in a future cleanup to avoid conflicting runtime behavior.

## Database Connectivity Behavior

Database connection is initialized during server startup via config/db.js.

If MongoDB connection fails:

- The backend logs warnings.
- The process may continue running depending on the failure path.
- API routes requiring DB will fail until connectivity is restored.

## Deployment Checklist

Before production deployment:

1. Set NODE_ENV=production.
2. Provide secure JWT_SECRET.
3. Set valid MONGO_URI for production cluster.
4. Set CORS_ORIGIN for frontend domain(s).
5. Confirm uploads directory handling and persistence strategy.
6. Validate health endpoint /api/health.
7. Run frontend build and smoke test critical workflows.

## Render Deployment Notes

Current backend/render.yaml uses:

- type: web
- env: node
- buildCommand: npm install
- startCommand: npm start
- healthCheckPath: /api/health

Configured env keys include:

- NODE_ENV
- PORT
- MONGO_URI
- JWT_SECRET
- CORS_ORIGIN

## Netlify Deployment Notes

Current frontend/netlify.toml includes:

- SPA rewrite from /* to /index.html
- publish directory dist
- build command npm run build
- NODE_VERSION=18 in build environment

## Suggested Verification Flow

After setup, verify in this order:

1. GET /api/health
2. POST /api/auth/register
3. POST /api/auth/login
4. GET protected profile route with token
5. Create and fetch listings
6. Create and review orders
7. Validate role-specific dashboard endpoints

## Known Gaps and Reality Check

- No integrated test runner workflow in package scripts yet.
- README-level endpoint documentation can drift when route files change.
- Some scripts and docs from earlier phases remain in repository and may be legacy.

For high-confidence changes, always check mounted routes in backend/server.js first.

## Roadmap-Friendly Improvements

Potential improvements for future iterations:

1. Add backend/.env.example with required keys.
2. Add OpenAPI/Swagger generation and docs route.
3. Standardize automated tests with a single runner.
4. Split route docs into versioned API reference.
5. Consolidate duplicate process error handlers in backend/server.js.
6. Normalize seeder scripts and ensure deterministic test seed data.

## Contributing

Suggested contribution flow:

1. Create a feature branch from main.
2. Keep changes scoped by module (frontend/backend/docs).
3. Update docs alongside behavioral/API changes.
4. Run lint/build checks before opening PR.
5. Include manual verification notes in the PR description.

## Support

If something is unclear or broken:

1. Check backend server logs first.
2. Verify MongoDB connectivity and credentials.
3. Confirm frontend proxy and CORS origins.
4. Re-test with a fresh JWT token.

This README is intentionally detailed so new contributors can start quickly without reverse-engineering the route layer.
