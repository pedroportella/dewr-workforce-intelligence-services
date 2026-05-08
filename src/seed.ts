// src/seed.ts
import { prisma } from './db.js';

async function main() {
  const existingTruck = await prisma.truck.findUnique({
    where: {
      truckCode: 'T-001',
    },
  });

  if (existingTruck) {
    console.log('Truck already seeded');
    return;
  }

  await prisma.truck.create({
    data: {
      truckCode: 'T-001',
      status: 'LOADING',
      x: 100,
      y: 100,
      isLoaded: false,
    },
  });

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });