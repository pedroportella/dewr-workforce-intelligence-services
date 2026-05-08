import {
  createTruck,
  findAllTrucks,
  findTruckByCode,
  findTruckById,
  updateTruckStatus,
} from './truck.repository.js';
import {
  truckStatuses,
  type CreateTruckInput,
  type TruckStatus,
  type UpdateTruckStatusInput,
} from './truck.types.js';

function isValidTruckStatus(value: string): value is TruckStatus {
  return truckStatuses.includes(value as TruckStatus);
}

function assertValidCoordinates(x: number, y: number) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error('x and y must be valid numbers');
  }

  if (x < 0 || x > 1000 || y < 0 || y > 800) {
    throw new Error('x must be between 0 and 1000 and y must be between 0 and 800');
  }
}

export async function getAllTrucks() {
  return findAllTrucks();
}

export async function createTruckRecord(input: CreateTruckInput) {
  if (!input.truckCode.trim()) {
    throw new Error('truckCode is required');
  }

  if (!isValidTruckStatus(input.status)) {
    throw new Error(`status must be one of: ${truckStatuses.join(', ')}`);
  }

  assertValidCoordinates(input.x, input.y);

  const existingTruck = await findTruckByCode(input.truckCode);

  if (existingTruck) {
    throw new Error('truckCode already exists');
  }

  return createTruck(input);
}

export async function updateTruckRecordStatus(id: string, input: UpdateTruckStatusInput) {
  if (!isValidTruckStatus(input.status)) {
    throw new Error(`status must be one of: ${truckStatuses.join(', ')}`);
  }

  if (typeof input.x === 'number' && typeof input.y === 'number') {
    assertValidCoordinates(input.x, input.y);
  }

  const existingTruck = await findTruckById(id);

  if (!existingTruck) {
    throw new Error('truck not found');
  }

  return updateTruckStatus(id, input);
}