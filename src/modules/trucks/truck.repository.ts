import { prisma } from '../../db.js';
import type { CreateTruckInput, UpdateTruckStatusInput } from './truck.types.js';

export async function findAllTrucks() {
  return prisma.truck.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export async function findTruckById(id: string) {
  return prisma.truck.findUnique({
    where: { id },
  });
}

export async function findTruckByCode(truckCode: string) {
  return prisma.truck.findUnique({
    where: { truckCode },
  });
}

export async function createTruck(input: CreateTruckInput) {
  return prisma.truck.create({
    data: input,
  });
}

export async function updateTruckStatus(id: string, input: UpdateTruckStatusInput) {
  return prisma.truck.update({
    where: { id },
    data: {
      status: input.status,
      ...(typeof input.x === 'number' ? { x: input.x } : {}),
      ...(typeof input.y === 'number' ? { y: input.y } : {}),
      ...(typeof input.isLoaded === 'boolean' ? { isLoaded: input.isLoaded } : {}),
    },
  });
}