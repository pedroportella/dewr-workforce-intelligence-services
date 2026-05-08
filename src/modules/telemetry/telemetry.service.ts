import { prisma } from '../../db.js';
import type {
  TelemetryIngestRequestDto,
  TelemetryIngestResponseDto,
} from '../../shared/contracts/telemetry-contracts.js';
import { inferDestinationZoneFromStatus, inferSpeedFromStatus } from '../simulation/simulation.helpers.js';

export async function ingestTelemetryEvents(
  payload: TelemetryIngestRequestDto,
): Promise<TelemetryIngestResponseDto> {
  const receivedAtUtc = new Date();

  for (const telemetryPoint of payload.snapshot.trucks) {
    const truck = await prisma.truck.upsert({
      where: { truckCode: telemetryPoint.truckCode },
      update: {
        status: telemetryPoint.status,
        x: telemetryPoint.x,
        y: telemetryPoint.y,
        isLoaded: telemetryPoint.isLoaded,
        lastTelemetryAt: new Date(telemetryPoint.updatedAtUtc),
        lastSimulationTick: payload.snapshot.simulationTick,
      },
      create: {
        truckCode: telemetryPoint.truckCode,
        status: telemetryPoint.status,
        x: telemetryPoint.x,
        y: telemetryPoint.y,
        isLoaded: telemetryPoint.isLoaded,
        lastTelemetryAt: new Date(telemetryPoint.updatedAtUtc),
        lastSimulationTick: payload.snapshot.simulationTick,
      },
    });

    await prisma.truckTelemetry.create({
      data: {
        truckId: truck.id,
        truckCode: telemetryPoint.truckCode,
        status: telemetryPoint.status,
        x: telemetryPoint.x,
        y: telemetryPoint.y,
        isLoaded: telemetryPoint.isLoaded,
        simulationTick: payload.snapshot.simulationTick,
        recordedAt: new Date(telemetryPoint.updatedAtUtc),
        speedKmh: inferSpeedFromStatus(telemetryPoint.status),
        destinationZone: inferDestinationZoneFromStatus(telemetryPoint.status),
      },
    });
  }

  await prisma.simulationState.upsert({
    where: { id: 'PRIMARY' },
    update: {
      source: payload.source,
      isRunning: payload.simulation.isRunning,
      tickIntervalMs: payload.simulation.tickIntervalMs,
      truckCount: payload.simulation.truckCount,
      simulationTick: payload.simulation.simulationTick,
      updatedAtUtc: new Date(payload.simulation.updatedAtUtc),
      lastIngestedAtUtc: receivedAtUtc,
    },
    create: {
      id: 'PRIMARY',
      source: payload.source,
      isRunning: payload.simulation.isRunning,
      tickIntervalMs: payload.simulation.tickIntervalMs,
      truckCount: payload.simulation.truckCount,
      simulationTick: payload.simulation.simulationTick,
      updatedAtUtc: new Date(payload.simulation.updatedAtUtc),
      lastIngestedAtUtc: receivedAtUtc,
    },
  });

  return {
    ok: true,
    ingestedTelemetryCount: payload.snapshot.trucks.length,
    simulationTick: payload.snapshot.simulationTick,
    source: payload.source,
    receivedAtUtc: receivedAtUtc.toISOString(),
  };
}
