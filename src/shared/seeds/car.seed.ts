
import { Manager } from '../../modules/managers/models/manager.model';
import { Car } from '../../modules/cars/models/car.model';
import { seedCategories } from './category.seed';
import { PasswordUtil } from '../utils/password.util';

const getOrCreateManager = async (): Promise<string> => {
  try {
    const existingManager = await Manager.findOne();

    if (existingManager) {
      console.log(`✅ Using existing manager: ${existingManager.name} (${existingManager.email})`);
      return existingManager.id;
    }

    console.log('📝 Creating dummy manager for seeding...');
    const hashedPassword = await PasswordUtil.hash('password123');

    const dummyManager = await Manager.create({
      name: 'Seed Manager',
      email: 'manager@seeddata.com',
      password: hashedPassword,
      isActive: true,
    });

    console.log(`✅ Created dummy manager: ${dummyManager.name} (${dummyManager.email})`);
    return dummyManager.id;
  } catch (error) {
    console.error('❌ Error getting or creating manager:', error);
    throw error;
  }
};

export const seedCars = async () => {
  try {
    const managerId = await getOrCreateManager();
    const categories = await seedCategories();
    const categoryMap = new Map(categories.map(cat => [cat.name, cat._id]));

    const cars = [
      {
        brand: 'Toyota',
        modelName: 'Camry',
        year: 2015,
        price: 35000,
        category: categoryMap.get('Sedan'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'hybrid',
        engineSize: 2.5,
        color: 'Silver',
        vin: 'ABC123456789XYZ001',
        condition: 'new',
        quantity: 3
      },
      {
        brand: 'Toyota',
        modelName: 'Camry',
        year: 2016,
        price: 38000,
        category: categoryMap.get('Sedan'),
        manager: managerId,
        mileage: 15000,
        transmission: 'automatic',
        fuelType: 'hybrid',
        engineSize: 2.5,
        color: 'Black',
        vin: 'ABC123456789XYZ101',
        condition: 'used',
        quantity: 2
      },
      {
        brand: 'Honda',
        modelName: 'CR-V',
        year: 2020,
        price: 38000,
        category: categoryMap.get('SUV'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 1.5,
        color: 'Blue',
        vin: 'ABC123456789XYZ002',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'Honda',
        modelName: 'CR-V',
        year: 2020,
        price: 42000,
        category: categoryMap.get('SUV'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'hybrid',
        engineSize: 2.0,
        color: 'Pearl White',
        vin: 'ABC123456789XYZ102',
        condition: 'new',
        quantity: 1
      },
      {
        brand: 'Tesla',
        modelName: 'Model 3',
        year: 2024,
        price: 45000,
        category: categoryMap.get('Sedan'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'electric',
        engineSize: 0,
        color: 'Red',
        vin: 'ABC123456789XYZ003',
        condition: 'new',
        quantity: 5
      },
      {
        brand: 'Tesla',
        modelName: 'Model 3',
        year: 2024,
        price: 55000,
        category: categoryMap.get('Sedan'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'electric',
        engineSize: 0,
        color: 'Midnight Silver',
        vin: 'ABC123456789XYZ103',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'Ford',
        modelName: 'F-150',
        year: 2012,
        price: 55000,
        category: categoryMap.get('Truck'),
        manager: managerId,
        mileage: 100,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 5.0,
        color: 'Black',
        vin: 'ABC123456789XYZ004',
        condition: 'used',
        quantity: 1
      },
      {
        brand: 'Ford',
        modelName: 'F-150',
        year: 2012,
        price: 58000,
        category: categoryMap.get('Truck'),
        manager: managerId,
        mileage: 80,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 5.0,
        color: 'Oxford White',
        vin: 'ABC123456789XYZ104',
        condition: 'used',
        quantity: 2
      },
      {
        brand: 'BMW',
        modelName: 'M3',
        year: 2025,
        price: 75000,
        category: categoryMap.get('Sports Car'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 3.0,
        color: 'White',
        vin: 'ABC123456789XYZ005',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'BMW',
        modelName: 'M3',
        year: 2025,
        price: 85000,
        category: categoryMap.get('Sports Car'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 3.0,
        color: 'Frozen Gray',
        vin: 'ABC123456789XYZ105',
        condition: 'new',
        quantity: 1
      },
      {
        brand: 'Volkswagen',
        modelName: 'Golf',
        year: 2018,
        price: 32000,
        category: categoryMap.get('Hatchback'),
        manager: managerId,
        mileage: 0,
        transmission: 'manual',
        fuelType: 'petrol',
        engineSize: 2.0,
        color: 'Green',
        vin: 'ABC123456789XYZ006',
        condition: 'new',
        quantity: 4
      },
      {
        brand: 'Volkswagen',
        modelName: 'Golf',
        year: 2018,
        price: 38000,
        category: categoryMap.get('Hatchback'),
        manager: managerId,
        mileage: 0,
        transmission: 'manual',
        fuelType: 'petrol',
        engineSize: 2.0,
        color: 'Tornado Red',
        vin: 'ABC123456789XYZ106',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'Mercedes-Benz',
        modelName: 'Sprinter',
        year: 2010,
        price: 45000,
        category: categoryMap.get('Van'),
        manager: managerId,
        mileage: 500,
        transmission: 'automatic',
        fuelType: 'diesel',
        engineSize: 2.0,
        color: 'Silver',
        vin: 'ABC123456789XYZ007',
        condition: 'used',
        quantity: 2
      },
      {
        brand: 'Mercedes-Benz',
        modelName: 'Sprinter',
        year: 2010,
        price: 48000,
        category: categoryMap.get('Van'),
        manager: managerId,
        mileage: 450,
        transmission: 'automatic',
        fuelType: 'diesel',
        engineSize: 2.0,
        color: 'Arctic White',
        vin: 'ABC123456789XYZ107',
        condition: 'used',
        quantity: 1
      },
      {
        brand: 'Porsche',
        modelName: '911',
        year: 2022,
        price: 120000,
        category: categoryMap.get('Sports Car'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 3.0,
        color: 'Yellow',
        vin: 'ABC123456789XYZ008',
        condition: 'new',
        quantity: 1
      },
      {
        brand: 'Porsche',
        modelName: '911',
        year: 2022,
        price: 205000,
        category: categoryMap.get('Sports Car'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 3.8,
        color: 'GT Silver',
        vin: 'ABC123456789XYZ108',
        condition: 'new',
        quantity: 1
      },
      {
        brand: 'Hyundai',
        modelName: 'Tucson',
        year: 2008,
        price: 35000,
        category: categoryMap.get('SUV'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'hybrid',
        engineSize: 1.6,
        color: 'Gray',
        vin: 'ABC123456789XYZ009',
        condition: 'new',
        quantity: 3
      },
      {
        brand: 'Hyundai',
        modelName: 'Tucson',
        year: 2008,
        price: 38000,
        category: categoryMap.get('SUV'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'hybrid',
        engineSize: 1.6,
        color: 'Amazon Gray',
        vin: 'ABC123456789XYZ109',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'Audi',
        modelName: 'A4',
        year: 2016,
        price: 48000,
        category: categoryMap.get('Sedan'),
        manager: managerId,
        mileage: 1000,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 2.0,
        color: 'Blue',
        vin: 'ABC123456789XYZ010',
        condition: 'used',
        quantity: 2
      },
      {
        brand: 'Audi',
        modelName: 'A4',
        year: 2016,
        price: 58000,
        category: categoryMap.get('Sedan'),
        manager: managerId,
        mileage: 500,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 3.0,
        color: 'Daytona Gray',
        vin: 'ABC123456789XYZ110',
        condition: 'used',
        quantity: 1
      },
      {
        brand: 'Chevrolet',
        modelName: 'Silverado',
        year: 2019,
        price: 52000,
        category: categoryMap.get('Truck'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 5.3,
        color: 'Red',
        vin: 'ABC123456789XYZ011',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'Chevrolet',
        modelName: 'Silverado',
        year: 2019,
        price: 62000,
        category: categoryMap.get('Truck'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'diesel',
        engineSize: 6.6,
        color: 'Summit White',
        vin: 'ABC123456789XYZ111',
        condition: 'new',
        quantity: 1
      },
      {
        brand: 'Mazda',
        modelName: '3',
        year: 2021,
        price: 28000,
        category: categoryMap.get('Hatchback'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 2.0,
        color: 'Soul Red Crystal',
        vin: 'ABC123456789XYZ012',
        condition: 'new',
        quantity: 4
      },
      {
        brand: 'Mazda',
        modelName: '3',
        year: 2021,
        price: 33000,
        category: categoryMap.get('Hatchback'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: 2.5,
        color: 'Machine Gray',
        vin: 'ABC123456789XYZ112',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'Lexus',
        modelName: 'RX',
        year: 2014,
        price: 58000,
        category: categoryMap.get('SUV'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'hybrid',
        engineSize: 2.5,
        color: 'Atomic Silver',
        vin: 'ABC123456789XYZ013',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'Lexus',
        modelName: 'RX',
        year: 2014,
        price: 65000,
        category: categoryMap.get('SUV'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'hybrid',
        engineSize: 2.5,
        color: 'Ultra White',
        vin: 'ABC123456789XYZ113',
        condition: 'new',
        quantity: 1
      },
      {
        brand: 'Kia',
        modelName: 'EV6',
        year: 2025,
        price: 45000,
        category: categoryMap.get('SUV'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'electric',
        engineSize: 0,
        color: 'Glacier White',
        vin: 'ABC123456789XYZ014',
        condition: 'new',
        quantity: 3
      },
      {
        brand: 'Kia',
        modelName: 'EV6',
        year: 2025,
        price: 52000,
        category: categoryMap.get('SUV'),
        manager: managerId,
        mileage: 0,
        transmission: 'automatic',
        fuelType: 'electric',
        engineSize: 0,
        color: 'Steel Gray',
        vin: 'ABC123456789XYZ114',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'Ford',
        modelName: 'Mustang',
        year: 2017,
        price: 65000,
        category: categoryMap.get('Sports Car'),
        manager: managerId,
        mileage: 0,
        transmission: 'manual',
        fuelType: 'petrol',
        engineSize: 5.0,
        color: 'Race Red',
        vin: 'ABC123456789XYZ015',
        condition: 'new',
        quantity: 2
      },
      {
        brand: 'Ford',
        modelName: 'Mustang',
        year: 2017,
        price: 85000,
        category: categoryMap.get('Sports Car'),
        manager: managerId,
        mileage: 0,
        transmission: 'manual',
        fuelType: 'petrol',
        engineSize: 5.2,
        color: 'Oxford White',
        vin: 'ABC123456789XYZ115',
        condition: 'new',
        quantity: 1
      }
    ];

    // Clear existing cars
    await Car.deleteMany({});

    // Insert new cars
    const createdCars = await Car.insertMany(cars);
    console.log('✅ Cars seeded successfully');
    return createdCars;
  } catch (error) {
    console.error('❌ Error seeding cars:', error);
    throw error;
  }
};