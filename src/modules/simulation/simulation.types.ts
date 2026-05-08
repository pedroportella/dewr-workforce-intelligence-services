import type {
  SimulationFleetSnapshotDto,
  SimulationStateDto,
  SimulationTruckSnapshotDto,
  SimulationTruckStatus,
} from '../../shared/contracts/simulation-contracts.js';

export type SimulationProxyConfig = {
  readonly baseUrl: string;
};

export type { SimulationFleetSnapshotDto, SimulationStateDto, SimulationTruckSnapshotDto, SimulationTruckStatus };
