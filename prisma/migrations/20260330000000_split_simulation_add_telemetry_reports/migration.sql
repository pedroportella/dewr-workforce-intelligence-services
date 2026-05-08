ALTER TABLE [dbo].[Truck]
ADD [lastTelemetryAt] DATETIME2 NULL;

ALTER TABLE [dbo].[Truck]
ADD [lastSimulationTick] INT NOT NULL
    CONSTRAINT [Truck_lastSimulationTick_df] DEFAULT 0;

CREATE TABLE [dbo].[TruckTelemetry] (
    [id] NVARCHAR(1000) NOT NULL,
    [truckId] NVARCHAR(1000) NULL,
    [truckCode] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [x] FLOAT(53) NOT NULL,
    [y] FLOAT(53) NOT NULL,
    [isLoaded] BIT NOT NULL
        CONSTRAINT [TruckTelemetry_isLoaded_df] DEFAULT 0,
    [simulationTick] INT NOT NULL,
    [recordedAt] DATETIME2 NOT NULL,
    [speedKmh] FLOAT(53) NOT NULL
        CONSTRAINT [TruckTelemetry_speedKmh_df] DEFAULT 0,
    [destinationZone] NVARCHAR(1000) NOT NULL
        CONSTRAINT [TruckTelemetry_destinationZone_df] DEFAULT N'loading-zone',
    [createdAt] DATETIME2 NOT NULL
        CONSTRAINT [TruckTelemetry_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [TruckTelemetry_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TruckTelemetry_truckId_fkey]
        FOREIGN KEY ([truckId]) REFERENCES [dbo].[Truck]([id])
        ON DELETE NO ACTION
        ON UPDATE CASCADE
);

CREATE TABLE [dbo].[SimulationState] (
    [id] NVARCHAR(1000) NOT NULL,
    [source] NVARCHAR(1000) NOT NULL
        CONSTRAINT [SimulationState_source_df] DEFAULT N'tracking-demo-simulation',
    [isRunning] BIT NOT NULL
        CONSTRAINT [SimulationState_isRunning_df] DEFAULT 0,
    [tickIntervalMs] INT NOT NULL
        CONSTRAINT [SimulationState_tickIntervalMs_df] DEFAULT 1000,
    [truckCount] INT NOT NULL
        CONSTRAINT [SimulationState_truckCount_df] DEFAULT 0,
    [simulationTick] INT NOT NULL
        CONSTRAINT [SimulationState_simulationTick_df] DEFAULT 0,
    [updatedAtUtc] DATETIME2 NOT NULL
        CONSTRAINT [SimulationState_updatedAtUtc_df] DEFAULT CURRENT_TIMESTAMP,
    [lastIngestedAtUtc] DATETIME2 NOT NULL
        CONSTRAINT [SimulationState_lastIngestedAtUtc_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [SimulationState_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE INDEX [TruckTelemetry_truckCode_simulationTick_idx]
ON [dbo].[TruckTelemetry]([truckCode], [simulationTick]);

CREATE INDEX [TruckTelemetry_recordedAt_idx]
ON [dbo].[TruckTelemetry]([recordedAt]);

IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[SimulationState]
    WHERE [id] = N'PRIMARY'
)
BEGIN
    INSERT INTO [dbo].[SimulationState] (
        [id],
        [source],
        [isRunning],
        [tickIntervalMs],
        [truckCount],
        [simulationTick],
        [updatedAtUtc],
        [lastIngestedAtUtc]
    )
    VALUES (
        N'PRIMARY',
        N'tracking-demo-simulation',
        0,
        1000,
        0,
        0,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
END;