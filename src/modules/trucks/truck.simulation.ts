import { prisma } from '../../db.js';
import { truckStatuses, type TruckStatus } from './truck.types.js';

const LOADING_ZONE = { x: 100, y: 100 };
const DUMP_ZONE = { x: 900, y: 700 };
const STEP_SIZE = 25;

function moveTowards(current: number, target: number, step: number) {
  const distance = target - current;

  if (Math.abs(distance) <= step) {
    return target;
  }

  return current + Math.sign(distance) * step;
}

function isTruckStatus(value: string): value is TruckStatus {
  return truckStatuses.includes(value as TruckStatus);
}

export async function ensureSimulationTruck() {
  const existingTruck = await prisma.truck.findUnique({
    where: {
      truckCode: 'T-001',
    },
  });

  if (existingTruck) {
    return existingTruck;
  }

  return prisma.truck.create({
    data: {
      truckCode: 'T-001',
      status: 'LOADING',
      x: LOADING_ZONE.x,
      y: LOADING_ZONE.y,
      isLoaded: false,
    },
  });
}

export async function runTruckSimulationTick() {
  const truck = await prisma.truck.findUnique({
    where: {
      truckCode: 'T-001',
    },
  });

  if (!truck) {
    return;
  }

  let nextStatus: TruckStatus = isTruckStatus(truck.status) ? truck.status : 'LOADING';
  let nextX = truck.x;
  let nextY = truck.y;
  let nextIsLoaded = truck.isLoaded;

  switch (nextStatus) {
    case 'LOADING':
      nextIsLoaded = true;
      nextStatus = 'HAULING';
      break;

    case 'HAULING':
      nextX = moveTowards(truck.x, DUMP_ZONE.x, STEP_SIZE);
      nextY = moveTowards(truck.y, DUMP_ZONE.y, STEP_SIZE);

      if (nextX === DUMP_ZONE.x && nextY === DUMP_ZONE.y) {
        nextStatus = 'DUMPING';
      }
      break;

    case 'DUMPING':
      nextIsLoaded = false;
      nextStatus = 'PUSHING';
      break;

    case 'PUSHING':
      nextX = moveTowards(truck.x, LOADING_ZONE.x, STEP_SIZE);
      nextY = moveTowards(truck.y, LOADING_ZONE.y, STEP_SIZE);

      if (nextX === LOADING_ZONE.x && nextY === LOADING_ZONE.y) {
        nextStatus = 'LOADING';
      }
      break;
  }

  await prisma.truck.update({
    where: {
      id: truck.id,
    },
    data: {
      status: nextStatus,
      x: nextX,
      y: nextY,
      isLoaded: nextIsLoaded,
    },
  });
}