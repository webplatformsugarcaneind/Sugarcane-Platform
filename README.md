# Sugarcane Web Platform

A comprehensive web platform connecting Farmers, Hub Head Managers (HHMs), Workers, and Factories in the sugarcane industry. This platform facilitates crop listings, job scheduling, worker applications, factory partnerships, and billing management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## ✨ Features

### User Roles

- **Farmer**: Create crop listings, browse HHMs and factories, view announcements
- **HHM (Hub Head Manager)**: Create job schedules, manage worker applications, send invitations, partner with factories
- **Worker**: Browse available jobs, apply for positions, receive invitations, manage profile
- **Factory**: Manage bills, post maintenance jobs, partner with HHMs, view dashboard statistics

### Core Functionality

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control
- 📝 **Profile Management**: Complete profile system for all user types
- 📋 **Job Scheduling**: HHM can create and manage job schedules with skill requirements
- 💼 **Application System**: Workers can apply for jobs, HHMs can approve/reject applications
- 🤝 **Invitation System**: Bidirectional invitations between HHMs and Factories, direct hire invitations from HHMs to Workers
- 💰 **Billing System**: Factories can create and manage bills for farmers
- 🏭 **Partnership Management**: Factory-HHM associations with invitation workflow
- 📊 **Dashboard Analytics**: Role-specific dashboards with statistics and insights

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

### Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **Routing**: React Router DOM 7.x
- **HTTP Client**: Axios

## 📁 Project Structure

```
sugarcane-web-platform/
├── backend/
│   ├── config/          # Configuration files (database, etc.)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, etc.)
│   ├── models/          # Mongoose models
│   ├── routes/          # API route definitions
│   ├── data/            # Seed data
│   ├── server.js        # Express server entry point
│   └── package.json     # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # React entry point
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
│
├── test/                # Test files
├── md/                  # Documentation files
└── README.md           # This file
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (v6 or higher) - Local installation or MongoDB Atlas account
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sugarcane-web-platform
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env file with your configuration
# See Environment Variables section below
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   mongod --dbpath /path/to/data/db
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in backend `.env` file

### 5. Seed Database (Optional)

```bash
# From backend directory
npm run data:import
```

## 🔧 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/sugarcane-platform
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sugarcane-platform?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
```

### Frontend

The frontend uses Vite's proxy configuration. Update `vite.config.js` if your backend runs on a different port:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000', // Change if needed
      changeOrigin: true,
    }
  }
}
```

## ▶️ Running the Application

### Development Mode

#### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Terminal 2 - Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend

```bash
cd backend
NODE_ENV=production npm start
```

## 📚 API Documentation

### Interactive API Documentation (Swagger)

Once the backend server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`

### API Endpoints Overview

#### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/verify` - Verify JWT token

#### Public (`/api/public`)
- `GET /api/public/factories` - Get all factories
- `GET /api/public/factories/:id` - Get factory by ID
- `GET /api/public/roles-features` - Get role features

#### Farmer (`/api/farmer`) - Protected
- `GET /api/farmer/profile` - Get farmer profile
- `PUT /api/farmer/profile` - Update farmer profile
- `GET /api/farmer/announcements` - Get announcements
- `POST /api/farmer/listings` - Create crop listing
- `GET /api/farmer/listings` - Get all listings
- `GET /api/farmer/hhms` - Get HHM directory
- `GET /api/farmer/factories` - Get factory directory

#### HHM (`/api/hhm`) - Protected
- `GET /api/hhm/profile` - Get HHM profile
- `POST /api/hhm/schedules` - Create job schedule
- `GET /api/hhm/schedules` - Get all schedules
- `GET /api/hhm/applications` - Get applications
- `PUT /api/hhm/applications/:id` - Update application status
- `POST /api/hhm/invitations` - Send invitation to worker
- `GET /api/hhm/workers` - Browse workers
- `GET /api/hhm/factory-invitations` - Get factory invitations
- `POST /api/hhm/invite-factory` - Invite factory

#### Worker (`/api/worker`) - Protected
- `GET /api/worker/profile` - Get worker profile
- `GET /api/worker/jobs` - Get job feed
- `POST /api/worker/applications` - Apply for job
- `GET /api/worker/applications` - Get my applications
- `GET /api/worker/invitations` - Get invitations
- `PUT /api/worker/invitations/:id` - Respond to invitation

#### Factory (`/api/factory`) - Protected
- `GET /api/factory/profile` - Get factory profile
- `POST /api/factory/bills` - Create bill
- `GET /api/factory/bills` - Get all bills
- `POST /api/factory/maintenance-jobs` - Create maintenance job
- `GET /api/factory/hhms` - Get HHM directory
- `POST /api/factory/invite-hhm` - Invite HHM
- `GET /api/factory/associated-hhms` - Get associated HHMs

For detailed API documentation with request/response examples, see:
- [API Documentation](./docs/API.md)
- [Swagger UI](http://localhost:5000/api-docs) (when server is running)

## 🏗 Architecture

### System Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP/HTTPS
       │
┌──────▼─────────────────┐
│   Frontend (React)     │
│   - Vite Dev Server    │
│   - React Router       │
│   - Axios              │
└──────┬─────────────────┘
       │ API Calls
       │
┌──────▼─────────────────┐
│   Backend (Express)    │
│   - JWT Auth           │
│   - Route Handlers     │
│   - Controllers        │
└──────┬─────────────────┘
       │
┌──────▼─────────────────┐
│   MongoDB Database     │
│   - Users              │
│   - Profiles           │
│   - Schedules          │
│   - Applications        │
│   - Invitations         │
└────────────────────────┘
```

### Database Schema

- **Users**: Authentication and basic user info
- **Profiles**: Extended profile data for each role
- **Schedules**: Job schedules created by HHMs
- **Applications**: Worker applications for jobs
- **Invitations**: Direct hire invitations and factory-HHM partnerships
- **Bills**: Factory billing records
- **CropListings**: Farmer crop listings
- **Announcements**: System announcements

For detailed architecture documentation, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 🚢 Deployment

### Backend Deployment

#### Option 1: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set MONGO_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set NODE_ENV=production
   ```
5. Deploy: `git push heroku main`

#### Option 2: DigitalOcean / AWS / Azure

1. Set up Node.js environment
2. Clone repository
3. Install dependencies: `npm install --production`
4. Set environment variables
5. Use PM2 or similar process manager:
   ```bash
   npm install -g pm2
   pm2 start server.js --name sugarcane-api
   ```

### Frontend Deployment

#### Option 1: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. From frontend directory: `vercel`
3. Configure environment variables if needed

#### Option 2: Netlify

1. Build the project: `npm run build`
2. Deploy `dist/` folder to Netlify
3. Configure redirects for SPA routing

#### Option 3: Static Hosting

1. Build: `npm run build`
2. Upload `dist/` folder to your hosting provider
3. Configure API proxy if needed

### Environment Variables for Production

Ensure all production environment variables are set:
- `NODE_ENV=production`
- `MONGO_URI` (production database)
- `JWT_SECRET` (strong, random secret)
- `PORT` (if not using default)

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

### Manual Testing

Test files are located in the `test/` directory:

```bash
# Run specific test
node test/integration/test-auth.js

# Run all integration tests
node test/integration/*.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use consistent indentation (2 spaces)
- Follow existing code patterns
- Add comments for complex logic
- Update documentation for new features

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.



**Built with ❤️ for the sugarcane industry**
