# Zyntherraa Backend Usage Guide

## Starting the Backend Server

### Development Mode
```bash
npm run dev
```
This will start the server in development mode with hot reloading.

### Production Mode
```bash
# First build the project
npm run build

# Then start the server
npm start
```

## Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/zyntherraa
JWT_SECRET=your_jwt_secret_here
UPLOAD_PATH=./uploads
```

## Database Seeding

To populate the database with sample data:
```bash
npm run seed
```

This will create:
- Sample categories and subcategories
- Sample products
- An admin user (admin@zyntherraa.com / admin123)

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Products
- `GET /api/products` - Get all products (with optional filtering)
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)
- `PUT /api/products/:id/status` - Toggle product status (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a specific category
- `POST /api/categories` - Create a new category (admin only)
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)
- `POST /api/categories/:id/subcategories` - Add a subcategory (admin only)
- `PUT /api/categories/:id/subcategories/:subId` - Update a subcategory (admin only)
- `DELETE /api/categories/:id/subcategories/:subId` - Delete a subcategory (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get authenticated user profile
- `PUT /api/users/:id` - Update user (admin or owner)
- `DELETE /api/users/:id` - Delete user (admin only)

### Orders
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/pay` - Mark order as paid (admin only)
- `PUT /api/orders/:id/deliver` - Mark order as delivered (admin only)
- `DELETE /api/orders/:id` - Delete an order (admin only)

### File Upload
- `POST /api/upload` - Upload a single file
- `POST /api/upload/multiple` - Upload multiple files

## File Storage Structure

Uploaded files are automatically organized in subdirectories:
```
uploads/
├── images/
├── videos/
└── misc/
```

Each file gets a unique name to prevent conflicts.

## Error Handling

All API endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "message": "Error description"
}
```

## Authentication

Most admin endpoints require authentication with a JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Testing

Run tests with:
```bash
npm test
```