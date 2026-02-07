# Zyntherraa - E-Commerce Platform

A modern, full-stack e-commerce application built with React, TypeScript, Node.js, Express, and MongoDB. This platform provides a complete solution for fashion retail with admin management, customer shopping experience, and PWA capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

Zyntherraa is a comprehensive e-commerce platform designed for fashion retail. It consists of:

- **Frontend**: React 19 + TypeScript SPA with PWA support
- **Backend**: Node.js/Express REST API with MongoDB
- **Features**: Product catalog, user authentication, order management, admin dashboard, file uploads

The application follows a monorepo structure with the frontend in the root and backend in the `backend/` directory.

## ✨ Features

### Customer Features
- 🛍️ Product browsing with categories and filters
- 🔍 Search functionality
- 🛒 Shopping cart (local state - needs API integration)
- 💳 Razorpay payment gateway integration
- 👤 User authentication and profiles
- 📱 Progressive Web App (PWA) support
- 🎨 Responsive design with Tailwind CSS

### Admin Features
- 📦 Product management (CRUD operations)
- 📂 Category and subcategory management
- 👥 User management
- 📊 Order management (partially implemented)
- 📈 Inventory tracking (mock data)
- 📄 Reports and analytics (mock data)
- 🖼️ File upload system for product images/videos

### Technical Features
- JWT-based authentication
- Role-based access control (Admin/Customer)
- RESTful API architecture
- MongoDB database with Mongoose ODM
- TypeScript for type safety
- Docker support for containerization

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0
- **TypeScript** 4.9.5
- **React Router** 7.9.4
- **Tailwind CSS** 3.4.18
- **Lucide React** (Icons)

### Backend
- **Node.js** 18+
- **Express** 4.18.2
- **TypeScript** 5.1.6
- **MongoDB** with **Mongoose** 7.5.0
- **JWT** (jsonwebtoken) for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Development Tools
- **Docker** & **Docker Compose**
- **Nodemon** for hot reloading
- **Jest** for testing (configured, minimal tests)

## 📁 Project Structure

```
Zyntherraa/
├── src/                          # Frontend React application
│   ├── components/              # Reusable components
│   │   ├── admin/              # Admin-specific components
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # UI components
│   ├── pages/                  # Page components
│   │   ├── admin/              # Admin pages
│   │   ├── auth/               # Authentication pages
│   │   └── user/               # Customer-facing pages
│   ├── contexts/               # React contexts (Auth)
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   └── config/                 # Configuration files
├── backend/                     # Backend API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── middleware/        # Express middleware (auth)
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API route handlers
│   │   ├── scripts/           # Utility scripts (seeding)
│   │   ├── utils/             # Utility functions
│   │   └── server.ts          # Express server entry point
│   ├── dist/                  # Compiled JavaScript
│   └── uploads/               # File upload storage
├── public/                     # Static assets
├── build/                      # Production build output
├── docs/                       # Documentation
├── Dockerfile                  # Docker configuration
└── docker-compose.yml          # Docker Compose setup
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (frontend) / 16+ (backend)
- npm or yarn
- MongoDB (local or cloud instance)
- Docker (optional, for containerized setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Zyntherraa
   ```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables**

   Create `.env` in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_NAME=Zyntherraa
   REACT_APP_VERSION=1.0.0
   ```

   Create `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/zyntherraa
   JWT_SECRET=your_jwt_secret_here_change_in_production
   UPLOAD_PATH=./uploads
   CORS_ORIGIN=http://localhost:3000
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
   
   **Note**: For Razorpay setup, see [Razorpay Quick Start Guide](docs/RAZORPAY_QUICK_START.md)

5. **Start MongoDB**
   - Local: Use `backend/start-db.bat` (Windows) or start MongoDB service
   - Docker: `docker-compose up -d mongodb`
   - Cloud: Use MongoDB Atlas connection string

6. **Seed the database** (optional)
   ```bash
   cd backend
   npm run seed
   cd ..
   ```

7. **Start development servers**

   Terminal 1 (Backend):
```bash
   cd backend
   npm run dev
```

   Terminal 2 (Frontend):
```bash
npm start
```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

### Default Admin Credentials (after seeding)
- Email: `admin@zyntherraa.com`
- Password: `admin123`

⚠️ **Note**: The seeded admin password is stored in plaintext. This must be fixed before production (see [Incomplete Features](#incomplete-features)).

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference with endpoints, request/response formats
- **[Frontend Documentation](docs/FRONTEND_DOCUMENTATION.md)** - Component architecture, pages, and frontend patterns
- **[Backend Documentation](docs/BACKEND_DOCUMENTATION.md)** - Server architecture, models, routes, and middleware
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Setup, workflow, and best practices
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Razorpay Setup](docs/RAZORPAY_SETUP.md)** - Complete Razorpay payment gateway integration guide
- **[Razorpay Quick Start](docs/RAZORPAY_QUICK_START.md)** - Quick 5-minute setup guide
- **[Incomplete Features](docs/INCOMPLETE_FEATURES.md)** - List of remaining work and priorities
- **[Project Status](docs/PROJECT_STATUS.md)** - Current state and known issues

## 🧪 Development

### Available Scripts

**Frontend (root directory)**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:full` - Build frontend and backend
- `npm test` - Run tests

**Backend (`backend/` directory)**
- `npm run dev` - Start with hot reloading
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests

### Development Workflow

1. Backend runs on port 5000 with hot reloading
2. Frontend runs on port 3000 with hot reloading
3. API calls from frontend go to `http://localhost:5000/api`
4. Backend serves compiled React build in production mode

### Code Structure Guidelines

- **Frontend**: Components in `src/components/`, pages in `src/pages/`
- **Backend**: Routes in `backend/src/routes/`, models in `backend/src/models/`
- **API**: Centralized in `src/utils/api.ts` with domain-specific helpers
- **Auth**: JWT tokens stored in localStorage, validated via middleware

## 🚢 Deployment

### Docker Deployment

```bash
docker-compose up --build
```

This starts:
- MongoDB service
- Backend API (port 5000)
- Frontend served by backend

### Manual Deployment

1. Build frontend: `npm run build`
2. Build backend: `cd backend && npm run build`
3. Set production environment variables
4. Start backend: `cd backend && npm start`

See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## ⚠️ Known Issues & Incomplete Features

See [Incomplete Features Documentation](docs/INCOMPLETE_FEATURES.md) for a complete list.

**Critical Issues:**
- 🔴 Seeded admin password is plaintext (must hash before production)
- 🔴 Docker build doesn't compile TypeScript (needs build step)
- 🔴 Several admin pages use mock data instead of API calls
- 🔴 Cart and product details pages need API integration

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit a pull request

## 📄 License

[Add your license here]

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Last Updated**: November 2025
