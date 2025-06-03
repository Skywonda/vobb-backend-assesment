import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedCars } from './car.seed';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    // Create a dummy manager ID for seeding
    const managerId = new mongoose.Types.ObjectId().toString();

    // Seed cars (which will also seed categories)
    await seedCars(managerId);

    console.log('✨ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed
seedDatabase(); 