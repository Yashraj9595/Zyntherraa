import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (mongoUri?: string): Promise<void> => {
  try {
    const uri = mongoUri || process.env.MONGO_URI || 'mongodb://localhost:27017/zyntherraa';
    const conn = await mongoose.connect(uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};