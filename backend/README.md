# Zyntherraa Backend API

This is the backend API for the Zyntherraa e-commerce application, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- RESTful API for products, categories, users, and orders
- MongoDB database integration
- File upload functionality with automatic organization in subdirectories
- JWT-based authentication
- TypeScript for type safety
- Modular architecture with separate routes, models, and middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

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
   ```

## Environment Variables

- `NODE_ENV` - Node environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `UPLOAD_PATH` - Path for file uploads (default: ./uploads)
- `CORS_ORIGIN` - CORS origin (optional, for development)

## Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

## API Endpoints

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
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/deliver` - Mark order as delivered
- `DELETE /api/orders/:id` - Delete an order

### File Upload
- `POST /api/upload` - Upload a single file
- `POST /api/upload/multiple` - Upload multiple files

## File Storage

Uploaded files are automatically organized in subdirectories based on their type:
- Images: `uploads/images/`
- Videos: `uploads/videos/`
- Other files: `uploads/misc/`

Each file is given a unique name to prevent conflicts.

## Database Models

### Product
- title (string)
- description (string)
- category (string)
- subcategory (string, optional)
- variants (array of ProductVariant)
- status (Active/Inactive)
- styleNumber (string, optional)
- fabric (string, optional)

### Category
- name (string)
- productCount (number)
- status (Active/Inactive)
- subcategories (array of Subcategory)

### User
- name (string)
- email (string)
- password (string, hashed)
- role (customer/admin)
- isActive (boolean)

### Order
- user (reference to User)
- items (array of OrderItem)
- shippingAddress (object)
- paymentMethod (string)
- paymentResult (object, optional)
- itemsPrice (number)
- taxPrice (number)
- shippingPrice (number)
- totalPrice (number)
- isPaid (boolean)
- paidAt (date, optional)
- isDelivered (boolean)
- deliveredAt (date, optional)