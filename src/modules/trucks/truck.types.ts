export const truckStatuses = ['LOADING', 'HAULING', 'DUMPING', 'PUSHING', 'IDLE'] as const;

export type TruckStatus = (typeof truckStatuses)[number];

export type CreateTruckInput = {
  truckCode: string;
  status: TruckStatus;
  x: number;
  y: number;
  isLoaded: boolean;
};

export type UpdateTruckStatusInput = {
  status: TruckStatus;
  x?: number;
  y?: number;
  isLoaded?: boolean;
};