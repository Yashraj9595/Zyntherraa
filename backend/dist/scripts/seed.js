"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zyntherraa');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
const seedData = async () => {
    try {
        await connectDB();
        await Product_1.default.deleteMany({});
        await Category_1.default.deleteMany({});
        await User_1.default.deleteMany({});
        const clothingCategory = await Category_1.default.create({
            name: "Clothing",
            productCount: 0,
            status: "Active",
            subcategories: []
        });
        const footwearCategory = await Category_1.default.create({
            name: "Footwear",
            productCount: 0,
            status: "Active",
            subcategories: []
        });
        const accessoriesCategory = await Category_1.default.create({
            name: "Accessories",
            productCount: 0,
            status: "Active",
            subcategories: []
        });
        clothingCategory.subcategories = [
            { name: "T-Shirts", productCount: 0, status: "Active", parentId: clothingCategory._id },
            { name: "Shirts", productCount: 0, status: "Active", parentId: clothingCategory._id },
            { name: "Jeans", productCount: 0, status: "Active", parentId: clothingCategory._id },
            { name: "Dresses", productCount: 0, status: "Active", parentId: clothingCategory._id }
        ];
        await clothingCategory.save();
        footwearCategory.subcategories = [
            { name: "Sneakers", productCount: 0, status: "Active", parentId: footwearCategory._id },
            { name: "Boots", productCount: 0, status: "Active", parentId: footwearCategory._id },
            { name: "Sandals", productCount: 0, status: "Active", parentId: footwearCategory._id }
        ];
        await footwearCategory.save();
        accessoriesCategory.subcategories = [
            { name: "Bags", productCount: 0, status: "Active", parentId: accessoriesCategory._id },
            { name: "Watches", productCount: 0, status: "Active", parentId: accessoriesCategory._id },
            { name: "Jewelry", productCount: 0, status: "Active", parentId: accessoriesCategory._id }
        ];
        await accessoriesCategory.save();
        console.log('Categories and subcategories inserted');
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
                        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
                        videos: [],
                        price: 1299,
                        stock: 45,
                        styleNumber: "CT-2023-001-M-BLUE",
                        fabric: "100% Cotton"
                    },
                    {
                        size: "L",
                        color: "White",
                        images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400'],
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
                        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
                        videos: [],
                        price: 2499,
                        stock: 25,
                        styleNumber: "RS-2023-002-9-BLACK",
                        fabric: "Synthetic Leather"
                    },
                    {
                        size: "10",
                        color: "White",
                        images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400'],
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
        await Product_1.default.insertMany(products);
        console.log('Products inserted');
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash("admin123", salt);
        const adminUser = new User_1.default({
            name: "Admin User",
            email: "admin@zyntherraa.com",
            password: hashedPassword,
            role: "admin",
            isActive: true,
            isVerified: true
        });
        await adminUser.save();
        console.log('Admin user created');
        console.log('Database seeding completed!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
seedData();
//# sourceMappingURL=seed.js.map