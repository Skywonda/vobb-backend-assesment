import mongoose from 'mongoose';
import { Category } from '../../modules/cars/models/category.model';

export const seedCategories = async () => {
  const categories = [
    {
      name: 'Sedan',
      description: 'A passenger car in a three-box configuration'
    },
    {
      name: 'SUV',
      description: 'Sport Utility Vehicle with increased ground clearance'
    },
    {
      name: 'Hatchback',
      description: 'Car with a rear door that opens upwards'
    },
    {
      name: 'Truck',
      description: 'Vehicle designed to transport cargo'
    },
    {
      name: 'Sports Car',
      description: 'High-performance vehicle designed for speed'
    },
    {
      name: 'Van',
      description: 'Vehicle used for transporting goods or people'
    }
  ];

  try {
    // Clear existing categories
    await Category.deleteMany({});

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Categories seeded successfully');
    return createdCategories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}; 