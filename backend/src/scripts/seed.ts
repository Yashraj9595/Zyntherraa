import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Product from '../models/Product';
import Category from '../models/Category';
import User from '../models/User';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zyntherraa');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    
    // Create sample categories
    const categories = [
      {
        name: "Clothing",
        productCount: 0,
        status: "Active",
        subcategories: [
          { name: "T-Shirts", productCount: 0, status: "Active", parentId: null },
          { name: "Shirts", productCount: 0, status: "Active", parentId: null },
          { name: "Jeans", productCount: 0, status: "Active", parentId: null },
          { name: "Dresses", productCount: 0, status: "Active", parentId: null }
        ]
      },
      {
        name: "Footwear",
        productCount: 0,
        status: "Active",
        subcategories: [
          { name: "Sneakers", productCount: 0, status: "Active", parentId: null },
          { name: "Boots", productCount: 0, status: "Active", parentId: null },
          { name: "Sandals", productCount: 0, status: "Active", parentId: null }
        ]
      },
      {
        name: "Accessories",
        productCount: 0,
        status: "Active",
        subcategories: [
          { name: "Bags", productCount: 0, status: "Active", parentId: null },
          { name: "Watches", productCount: 0, status: "Active", parentId: null },
          { name: "Jewelry", productCount: 0, status: "Active", parentId: null }
        ]
      }
    ];
    
    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories inserted');
    
    // Create sample products
    const products = [
      {
        title: "Cotton T-Shirt",
        description: "Comfortable cotton t-shirt for daily wear",
        category: "Clothing",
        subcategory: "T-Shirts",
        styleNumber: "CT-2023-001",
        fabric: "100% Cotton",
        variants: [
          { 
            size: "M", 
            color: "Blue", 
            images: [], 
            videos: [], 
            price: 1299, 
            stock: 45, 
            styleNumber: "CT-2023-001-M-BLUE", 
            fabric: "100% Cotton" 
          },
          { 
            size: "L", 
            color: "White", 
            images: [], 
            videos: [], 
            price: 1299, 
            stock: 30, 
            styleNumber: "CT-2023-001-L-WHITE", 
            fabric: "100% Cotton" 
          }
        ],
        status: "Active"
      },
      {
        title: "Running Sneakers",
        description: "Lightweight running shoes for athletes",
        category: "Footwear",
        subcategory: "Sneakers",
        styleNumber: "RS-2023-002",
        fabric: "Synthetic Leather",
        variants: [
          { 
            size: "9", 
            color: "Black", 
            images: [], 
            videos: [], 
            price: 2499, 
            stock: 25, 
            styleNumber: "RS-2023-002-9-BLACK", 
            fabric: "Synthetic Leather" 
          },
          { 
            size: "10", 
            color: "White", 
            images: [], 
            videos: [], 
            price: 2499, 
            stock: 20, 
            styleNumber: "RS-2023-002-10-WHITE", 
            fabric: "Synthetic Leather" 
          }
        ],
        status: "Active"
      }
    ];
    
    // Insert products
    await Product.insertMany(products);
    console.log('Products inserted');
    
    // Create sample admin user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    
    const adminUser = new User({
      name: "Admin User",
      email: "admin@zyntherraa.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      isVerified: true // Admin users are pre-verified
    });
    
    await adminUser.save();
    console.log('Admin user created');
    
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();