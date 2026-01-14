# Zyntherraa Backend API

This is the backend API for the Zyntherraa e-commerce application, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- RESTful API for products, categories, users, and orders
- MongoDB database integration
- File upload functionality with automatic organization in subdirectories
- JWT-based authentication
- OTP-based email verification for registration, login, and password reset
- TypeScript for type safety
- Modular architecture with separate routes, models, and middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn
- SMTP email service (Gmail, SendGrid, etc.) for OTP verification

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/zyntherraa
   JWT_SECRET=your_jwt_secret_here
   UPLOAD_PATH=./uploads
   
   # SMTP Configuration for Email (OTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

## Environment Variables

- `NODE_ENV` - Node environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `UPLOAD_PATH` - Path for file uploads (default: ./uploads)
- `CORS_ORIGIN` - Comma-separated list of allowed origins
- `SMTP_HOST` - SMTP server host (default: smtp.gmail.com)
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_SECURE` - Use secure connection (true for 465, false for 587)
- `SMTP_USER` - SMTP username (your email)
- `SMTP_PASS` - SMTP password (app password for Gmail)

## Gmail Setup (for OTP emails)

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS`

## Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

## API Endpoints

### Authentication (with OTP)
- `POST /api/users/register` - Register a new user (sends OTP)
- `POST /api/users/verify-otp` - Verify OTP for registration
- `POST /api/users/resend-otp` - Resend OTP
- `POST /api/users/login` - Login user (sends OTP)
- `POST /api/users/verify-login-otp` - Verify OTP for login
- `POST /api/users/forgot-password` - Request password reset (sends OTP)
- `POST /api/users/verify-reset-otp` - Verify OTP for password reset
- `POST /api/users/reset-password` - Reset password with token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `PUT /api/products/:id/status` - Toggle product status

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a specific category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get authenticated user profile
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update an order
- `PUT /api/orders/:id/status` - Update order status

## Database Seeding

To populate the database with sample data:
```bash
npm run seed
```

This will create:
- Sample categories and subcategories
- Sample products
- An admin user (admin@zyntherraa.com / admin123)

**Note:** Admin user will need to verify email with OTP on first login.
