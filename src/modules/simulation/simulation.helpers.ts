import type { SimulationTruckStatus } from '../../shared/contracts/simulation-contracts.js';

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 800;
export const LOADING_ZONE = { id: 'loading-zone', x: 100, y: 100, radius: 60 } as const;
export const DUMP_ZONE = { id: 'dump-zone', x: 900, y: 700, radius: 60 } as const;

export function inferSpeedFromStatus(status: SimulationTruckStatus): number {
  switch (status) {
    case 'LOADING':
      return 8;
    case 'HAULING':
      return 24;
    case 'PUSHING':
      return 18;
    case 'DUMPING':
      return 6;
    case 'IDLE':
    default:
      return 0;
  }
}

export function inferDestinationZoneFromStatus(status: SimulationTruckStatus): string {
  switch (status) {
    case 'LOADING':
    case 'HAULING':
      return DUMP_ZONE.id;
    case 'PUSHING':
    case 'DUMPING':
    case 'IDLE':
    default:
      return LOADING_ZONE.id;
  }
}

export function isInsideZone(x: number, y: number, zone: { x: number; y: number; radius: number }): boolean {
  const deltaX = x - zone.x;
  const deltaY = y - zone.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return distance <= zone.radius;
}

export function calculateDistance(fromX: number, fromY: number, toX: number, toY: number): number {
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
