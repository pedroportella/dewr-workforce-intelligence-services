import type { SimulationTruckStatus } from './simulation-contracts.js';

export type StatusCountSummaryDto = Record<SimulationTruckStatus, number>;

export type FleetReportSummaryDto = {
  readonly generatedAtUtc: string;
  readonly totalTrucks: number;
  readonly totalTelemetryPoints: number;
  readonly latestSimulationTick: number;
  readonly lastTelemetryReceivedAtUtc: string | null;
  readonly averageSpeedKmh: number;
  readonly totalDistanceTravelled: number;
  readonly completedCycles: number;
  readonly statusCounts: StatusCountSummaryDto;
};

export type TruckUtilisationReportRowDto = {
  readonly truckCode: string;
  readonly loadingSeconds: number;
  readonly haulingSeconds: number;
  readonly dumpingSeconds: number;
  readonly pushingSeconds: number;
  readonly idleSeconds: number;
  readonly utilisationPercentage: number;
};

export type TruckCycleReportRowDto = {
  readonly truckCode: string;
  readonly completedCycles: number;
  readonly averageCycleSeconds: number;
  readonly minimumCycleSeconds: number;
  readonly maximumCycleSeconds: number;
};

export type TruckDistanceReportRowDto = {
  readonly truckCode: string;
  readonly totalDistance: number;
  readonly loadedDistance: number;
  readonly unloadedDistance: number;
  readonly averageDistancePerTick: number;
};

export type ZoneActivityReportRowDto = {
  readonly zoneId: string;
  readonly entries: number;
  readonly exits: number;
  readonly totalDwellSeconds: number;
  readonly averageDwellSeconds: number;
};

export type TelemetryHistoryPointDto = {
  readonly truckCode: string;
  readonly simulationTick: number;
  readonly status: SimulationTruckStatus;
  readonly x: number;
  readonly y: number;
  readonly isLoaded: boolean;
  readonly speedKmh: number;
  readonly destinationZone: string;
  readonly recordedAtUtc: string;
};

export type TelemetryHistoryReportDto = {
  readonly generatedAtUtc: string;
  readonly truckCode: string | null;
  readonly points: readonly TelemetryHistoryPointDto[];
};

export type FleetExceptionsReportDto = {
  readonly generatedAtUtc: string;
  readonly staleTrucks: readonly string[];
  readonly longIdleTrucks: readonly string[];
  readonly outOfBoundsTelemetryCount: number;
};

export type FleetProductivityReportDto = {
  readonly generatedAtUtc: string;
  readonly completedCycles: number;
  readonly busiestTruckCode: string | null;
  readonly leastActiveTruckCode: string | null;
  readonly cyclesByTruck: readonly TruckCycleReportRowDto[];
};
