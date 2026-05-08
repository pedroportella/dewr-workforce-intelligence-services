import { prisma } from '../../db.js';
import type {
  FleetExceptionsReportDto,
  FleetProductivityReportDto,
  FleetReportSummaryDto,
  TelemetryHistoryPointDto,
  TelemetryHistoryReportDto,
  TruckCycleReportRowDto,
  TruckDistanceReportRowDto,
  TruckUtilisationReportRowDto,
  ZoneActivityReportRowDto,
} from '../../shared/contracts/report-contracts.js';
import type { SimulationTruckStatus } from '../../shared/contracts/simulation-contracts.js';
import {
  DUMP_ZONE,
  LOADING_ZONE,
  MAP_HEIGHT,
  MAP_WIDTH,
  calculateDistance,
  isInsideZone,
} from '../simulation/simulation.helpers.js';

const ALL_STATUSES: readonly SimulationTruckStatus[] = ['LOADING', 'HAULING', 'DUMPING', 'PUSHING', 'IDLE'];
const DEFAULT_LIMIT = 500;

type TelemetryPoint = {
  truckCode: string;
  status: SimulationTruckStatus;
  x: number;
  y: number;
  isLoaded: boolean;
  simulationTick: number;
  recordedAt: Date;
  speedKmh: number;
  destinationZone: string;
};

type ReportRange = {
  from?: Date;
  to?: Date;
  limit?: number;
  truckCode?: string;
};

function buildWhere(range: ReportRange) {
  return {
    ...(range.truckCode ? { truckCode: range.truckCode } : {}),
    ...(range.from || range.to
      ? {
          recordedAt: {
            ...(range.from ? { gte: range.from } : {}),
            ...(range.to ? { lte: range.to } : {}),
          },
        }
      : {}),
  };
}

async function loadTelemetry(range: ReportRange = {}): Promise<TelemetryPoint[]> {
  const telemetry = await prisma.truckTelemetry.findMany({
    where: buildWhere(range),
    orderBy: [{ truckCode: 'asc' }, { simulationTick: 'asc' }, { recordedAt: 'asc' }],
    ...(range.limit ? { take: range.limit } : {}),
  });

  return telemetry.map((item) => ({
    truckCode: item.truckCode,
    status: ALL_STATUSES.includes(item.status as SimulationTruckStatus)
      ? (item.status as SimulationTruckStatus)
      : 'IDLE',
    x: item.x,
    y: item.y,
    isLoaded: item.isLoaded,
    simulationTick: item.simulationTick,
    recordedAt: item.recordedAt,
    speedKmh: item.speedKmh,
    destinationZone: item.destinationZone,
  }));
}

function groupTelemetryByTruck(telemetry: readonly TelemetryPoint[]): Map<string, TelemetryPoint[]> {
  const groupedTelemetry = new Map<string, TelemetryPoint[]>();

  for (const telemetryPoint of telemetry) {
    const truckPoints = groupedTelemetry.get(telemetryPoint.truckCode) ?? [];
    truckPoints.push(telemetryPoint);
    groupedTelemetry.set(telemetryPoint.truckCode, truckPoints);
  }

  return groupedTelemetry;
}

function getDurationSeconds(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / 1000);
}

function buildStatusCountSummary(latestPoints: readonly TelemetryPoint[]) {
  return {
    LOADING: latestPoints.filter((point) => point.status === 'LOADING').length,
    HAULING: latestPoints.filter((point) => point.status === 'HAULING').length,
    DUMPING: latestPoints.filter((point) => point.status === 'DUMPING').length,
    PUSHING: latestPoints.filter((point) => point.status === 'PUSHING').length,
    IDLE: latestPoints.filter((point) => point.status === 'IDLE').length,
  };
}

function calculateTotalDistance(points: readonly TelemetryPoint[]) {
  let totalDistance = 0;
  let loadedDistance = 0;
  let unloadedDistance = 0;

  for (let index = 1; index < points.length; index += 1) {
    const previousPoint = points[index - 1];
    const currentPoint = points[index];
    const distance = calculateDistance(previousPoint.x, previousPoint.y, currentPoint.x, currentPoint.y);
    totalDistance += distance;

    if (currentPoint.isLoaded) {
      loadedDistance += distance;
    } else {
      unloadedDistance += distance;
    }
  }

  return { totalDistance, loadedDistance, unloadedDistance };
}

function calculateCycleMetrics(points: readonly TelemetryPoint[]): TruckCycleReportRowDto {
  const haulStarts = points.filter((point, index) => {
    const previousStatus = index > 0 ? points[index - 1]?.status : null;
    return point.status === 'HAULING' && previousStatus !== 'HAULING';
  });

  const cycleDurations: number[] = [];

  for (let index = 1; index < haulStarts.length; index += 1) {
    cycleDurations.push(getDurationSeconds(haulStarts[index - 1].recordedAt, haulStarts[index].recordedAt));
  }

  const completedCycles = Math.max(0, haulStarts.length - 1);

  if (cycleDurations.length === 0) {
    return {
      truckCode: points[0]?.truckCode ?? 'UNKNOWN',
      completedCycles,
      averageCycleSeconds: 0,
      minimumCycleSeconds: 0,
      maximumCycleSeconds: 0,
    };
  }

  const totalDuration = cycleDurations.reduce((sum, value) => sum + value, 0);

  return {
    truckCode: points[0]?.truckCode ?? 'UNKNOWN',
    completedCycles,
    averageCycleSeconds: totalDuration / cycleDurations.length,
    minimumCycleSeconds: Math.min(...cycleDurations),
    maximumCycleSeconds: Math.max(...cycleDurations),
  };
}

function calculateUtilisation(points: readonly TelemetryPoint[]): TruckUtilisationReportRowDto {
  const totals: Record<SimulationTruckStatus, number> = {
    LOADING: 0,
    HAULING: 0,
    DUMPING: 0,
    PUSHING: 0,
    IDLE: 0,
  };

  for (let index = 1; index < points.length; index += 1) {
    const previousPoint = points[index - 1];
    const currentPoint = points[index];
    totals[previousPoint.status] += getDurationSeconds(previousPoint.recordedAt, currentPoint.recordedAt);
  }

  const totalTrackedSeconds = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const productiveSeconds = totals.LOADING + totals.HAULING + totals.DUMPING + totals.PUSHING;

  return {
    truckCode: points[0]?.truckCode ?? 'UNKNOWN',
    loadingSeconds: totals.LOADING,
    haulingSeconds: totals.HAULING,
    dumpingSeconds: totals.DUMPING,
    pushingSeconds: totals.PUSHING,
    idleSeconds: totals.IDLE,
    utilisationPercentage:
      totalTrackedSeconds === 0 ? 0 : (productiveSeconds / totalTrackedSeconds) * 100,
  };
}

function calculateZoneActivity(points: readonly TelemetryPoint[]): ZoneActivityReportRowDto[] {
  const zones = [LOADING_ZONE, DUMP_ZONE].map((zone) => ({
    zoneId: zone.id,
    entries: 0,
    exits: 0,
    totalDwellSeconds: 0,
    averageDwellSeconds: 0,
    dwellVisits: 0,
  }));

  for (const zoneSummary of zones) {
    let entryTime: Date | null = null;
    let previousInside = false;

    for (const point of points) {
      const zone = zoneSummary.zoneId === LOADING_ZONE.id ? LOADING_ZONE : DUMP_ZONE;
      const currentInside = isInsideZone(point.x, point.y, zone);

      if (currentInside && !previousInside) {
        zoneSummary.entries += 1;
        entryTime = point.recordedAt;
      }

      if (!currentInside && previousInside && entryTime) {
        zoneSummary.exits += 1;
        zoneSummary.totalDwellSeconds += getDurationSeconds(entryTime, point.recordedAt);
        zoneSummary.dwellVisits += 1;
        entryTime = null;
      }

      previousInside = currentInside;
    }
  }

  return zones.map((zoneSummary) => ({
    zoneId: zoneSummary.zoneId,
    entries: zoneSummary.entries,
    exits: zoneSummary.exits,
    totalDwellSeconds: zoneSummary.totalDwellSeconds,
    averageDwellSeconds:
      zoneSummary.dwellVisits === 0 ? 0 : zoneSummary.totalDwellSeconds / zoneSummary.dwellVisits,
  }));
}

export async function getFleetReportSummary(range: ReportRange = {}): Promise<FleetReportSummaryDto> {
  const telemetry = await loadTelemetry(range);
  const groupedTelemetry = groupTelemetryByTruck(telemetry);
  const latestPoints = Array.from(groupedTelemetry.values()).map((points) => points[points.length - 1]).filter(Boolean);
  const totalDistanceTravelled = Array.from(groupedTelemetry.values()).reduce(
    (sum, points) => sum + calculateTotalDistance(points).totalDistance,
    0,
  );
  const cycleRows = Array.from(groupedTelemetry.values()).map(calculateCycleMetrics);
  const latestSimulationTick = telemetry.length === 0 ? 0 : Math.max(...telemetry.map((point) => point.simulationTick));

  return {
    generatedAtUtc: new Date().toISOString(),
    totalTrucks: latestPoints.length,
    totalTelemetryPoints: telemetry.length,
    latestSimulationTick,
    lastTelemetryReceivedAtUtc:
      telemetry.length === 0 ? null : telemetry[telemetry.length - 1].recordedAt.toISOString(),
    averageSpeedKmh:
      latestPoints.length === 0
        ? 0
        : latestPoints.reduce((sum, point) => sum + point.speedKmh, 0) / latestPoints.length,
    totalDistanceTravelled,
    completedCycles: cycleRows.reduce((sum, row) => sum + row.completedCycles, 0),
    statusCounts: buildStatusCountSummary(latestPoints),
  };
}

export async function getTruckUtilisationReport(range: ReportRange = {}): Promise<TruckUtilisationReportRowDto[]> {
  const telemetry = await loadTelemetry(range);
  return Array.from(groupTelemetryByTruck(telemetry).values()).map(calculateUtilisation);
}

export async function getTruckCycleReport(range: ReportRange = {}): Promise<TruckCycleReportRowDto[]> {
  const telemetry = await loadTelemetry(range);
  return Array.from(groupTelemetryByTruck(telemetry).values()).map(calculateCycleMetrics);
}

export async function getTruckDistanceReport(range: ReportRange = {}): Promise<TruckDistanceReportRowDto[]> {
  const telemetry = await loadTelemetry(range);
  return Array.from(groupTelemetryByTruck(telemetry).values()).map((points) => {
    const { totalDistance, loadedDistance, unloadedDistance } = calculateTotalDistance(points);
    return {
      truckCode: points[0]?.truckCode ?? 'UNKNOWN',
      totalDistance,
      loadedDistance,
      unloadedDistance,
      averageDistancePerTick: points.length <= 1 ? 0 : totalDistance / (points.length - 1),
    };
  });
}

export async function getZoneActivityReport(range: ReportRange = {}): Promise<ZoneActivityReportRowDto[]> {
  const telemetry = await loadTelemetry(range);
  const groupedTelemetry = Array.from(groupTelemetryByTruck(telemetry).values());
  const totals = new Map<string, ZoneActivityReportRowDto>();

  for (const truckPoints of groupedTelemetry) {
    for (const row of calculateZoneActivity(truckPoints)) {
      const current = totals.get(row.zoneId) ?? {
        zoneId: row.zoneId,
        entries: 0,
        exits: 0,
        totalDwellSeconds: 0,
        averageDwellSeconds: 0,
      };
      current.entries += row.entries;
      current.exits += row.exits;
      current.totalDwellSeconds += row.totalDwellSeconds;
      totals.set(row.zoneId, current);
    }
  }

  return Array.from(totals.values()).map((row) => ({
    ...row,
    averageDwellSeconds: row.entries === 0 ? 0 : row.totalDwellSeconds / row.entries,
  }));
}

export async function getTelemetryHistoryReport(range: ReportRange = {}): Promise<TelemetryHistoryReportDto> {
  const telemetry = await loadTelemetry({ ...range, limit: range.limit ?? DEFAULT_LIMIT });
  const points: TelemetryHistoryPointDto[] = telemetry.map((point) => ({
    truckCode: point.truckCode,
    simulationTick: point.simulationTick,
    status: point.status,
    x: point.x,
    y: point.y,
    isLoaded: point.isLoaded,
    speedKmh: point.speedKmh,
    destinationZone: point.destinationZone,
    recordedAtUtc: point.recordedAt.toISOString(),
  }));

  return {
    generatedAtUtc: new Date().toISOString(),
    truckCode: range.truckCode ?? null,
    points,
  };
}

export async function getFleetExceptionsReport(range: ReportRange = {}): Promise<FleetExceptionsReportDto> {
  const telemetry = await loadTelemetry(range);
  const groupedTelemetry = groupTelemetryByTruck(telemetry);
  const simulationState = await prisma.simulationState.findUnique({ where: { id: 'PRIMARY' } });
  const staleThresholdMs = Math.max(2, simulationState?.tickIntervalMs ?? 1000) * 2;
  const longIdleThresholdSeconds = 5 * 60;
  const staleTrucks: string[] = [];
  const longIdleTrucks: string[] = [];
  let outOfBoundsTelemetryCount = 0;

  for (const [truckCode, points] of groupedTelemetry.entries()) {
    const lastPoint = points[points.length - 1];

    if (lastPoint && Date.now() - lastPoint.recordedAt.getTime() > staleThresholdMs) {
      staleTrucks.push(truckCode);
    }

    const utilisation = calculateUtilisation(points);
    if (utilisation.idleSeconds >= longIdleThresholdSeconds) {
      longIdleTrucks.push(truckCode);
    }

    outOfBoundsTelemetryCount += points.filter(
      (point) => point.x < 0 || point.x > MAP_WIDTH || point.y < 0 || point.y > MAP_HEIGHT,
    ).length;
  }

  return {
    generatedAtUtc: new Date().toISOString(),
    staleTrucks,
    longIdleTrucks,
    outOfBoundsTelemetryCount,
  };
}

export async function getFleetProductivityReport(range: ReportRange = {}): Promise<FleetProductivityReportDto> {
  const cycleRows = await getTruckCycleReport(range);
  const sortedByCycles = [...cycleRows].sort((left, right) => right.completedCycles - left.completedCycles);

  return {
    generatedAtUtc: new Date().toISOString(),
    completedCycles: cycleRows.reduce((sum, row) => sum + row.completedCycles, 0),
    busiestTruckCode: sortedByCycles[0]?.truckCode ?? null,
    leastActiveTruckCode: sortedByCycles[sortedByCycles.length - 1]?.truckCode ?? null,
    cyclesByTruck: cycleRows,
  };
}
