import type {
  SimulationFleetSnapshotDto,
  SimulationStateDto,
} from './simulation-contracts.js';

export type TelemetryIngestRequestDto = {
  readonly source: string;
  readonly simulation: SimulationStateDto;
  readonly snapshot: SimulationFleetSnapshotDto;
};

export type TelemetryIngestResponseDto = {
  readonly ok: true;
  readonly ingestedTelemetryCount: number;
  readonly simulationTick: number;
  readonly source: string;
  readonly receivedAtUtc: string;
};
