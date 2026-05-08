import { prisma } from '../../db.js';
import type {
  SimulationCommandResponseDto,
  SimulationFleetSnapshotDto,
  SimulationStateDto,
} from '../../shared/contracts/simulation-contracts.js';
import { simulationTruckStatuses } from '../../shared/contracts/simulation-contracts.js';

const DEFAULT_TICK_INTERVAL_MS = Number(process.env.SIMULATION_INTERVAL_MS || 1000);
const SIMULATION_API_BASE_URL = (process.env.SIMULATION_API_BASE_URL || 'http://localhost:4100').replace(/\/$/, '');

function isSimulationTruckStatus(value: string): value is (typeof simulationTruckStatuses)[number] {
  return simulationTruckStatuses.includes(value as (typeof simulationTruckStatuses)[number]);
}

function asIsoString(value: Date | string | null | undefined): string {
  if (!value) {
    return new Date(0).toISOString();
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function buildDefaultSimulationState(): SimulationStateDto {
  return {
    isRunning: false,
    tickIntervalMs: DEFAULT_TICK_INTERVAL_MS,
    truckCount: 0,
    simulationTick: 0,
    updatedAtUtc: new Date(0).toISOString(),
  };
}

async function getPersistedSimulationState(): Promise<SimulationStateDto> {
  const state = await prisma.simulationState.findUnique({ where: { id: 'PRIMARY' } });

  if (!state) {
    return buildDefaultSimulationState();
  }

  return {
    isRunning: state.isRunning,
    tickIntervalMs: state.tickIntervalMs,
    truckCount: state.truckCount,
    simulationTick: state.simulationTick,
    updatedAtUtc: state.updatedAtUtc.toISOString(),
  };
}

async function callSimulationApi(method: 'GET' | 'POST', path: string): Promise<Response> {
  return fetch(`${SIMULATION_API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function readSimulationCommandResponse(path: string): Promise<SimulationCommandResponseDto> {
  const response = await callSimulationApi('POST', path);

  if (!response.ok) {
    throw new Error(`Simulation API request failed with status ${response.status}`);
  }

  return response.json() as Promise<SimulationCommandResponseDto>;
}

export async function initializeSimulation(): Promise<void> {
  await prisma.simulationState.upsert({
    where: { id: 'PRIMARY' },
    update: {},
    create: {
      id: 'PRIMARY',
      source: 'tracking-demo-simulation',
      isRunning: false,
      tickIntervalMs: DEFAULT_TICK_INTERVAL_MS,
      truckCount: 0,
      simulationTick: 0,
      updatedAtUtc: new Date(),
      lastIngestedAtUtc: new Date(),
    },
  });
}

export async function getSimulationSnapshot(): Promise<SimulationFleetSnapshotDto> {
  const trucks = await prisma.truck.findMany({ orderBy: { truckCode: 'asc' } });
  const state = await getPersistedSimulationState();

  return {
    trucks: trucks.map((truck) => ({
      id: truck.id,
      truckCode: truck.truckCode,
      status: isSimulationTruckStatus(truck.status) ? truck.status : 'IDLE',
      x: truck.x,
      y: truck.y,
      isLoaded: truck.isLoaded,
      updatedAtUtc: asIsoString(truck.lastTelemetryAt ?? truck.updatedAt),
    })),
    simulationTick: state.simulationTick,
    snapshotTakenAtUtc: new Date().toISOString(),
  };
}

export async function getSimulationState(): Promise<SimulationStateDto> {
  return getPersistedSimulationState();
}

export async function tickSimulation(): Promise<SimulationCommandResponseDto> {
  return readSimulationCommandResponse('/simulation/tick');
}

export async function resetSimulation(): Promise<SimulationCommandResponseDto> {
  return readSimulationCommandResponse('/simulation/reset');
}

export async function startSimulation(): Promise<SimulationCommandResponseDto> {
  return readSimulationCommandResponse('/simulation/start');
}

export async function stopSimulation(): Promise<SimulationCommandResponseDto> {
  return readSimulationCommandResponse('/simulation/stop');
}
