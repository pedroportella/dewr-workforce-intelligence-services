BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[TruckTelemetry] DROP CONSTRAINT [TruckTelemetry_truckId_fkey];

-- AlterTable
ALTER TABLE [dbo].[SimulationState] DROP CONSTRAINT [SimulationState_source_df];
ALTER TABLE [dbo].[SimulationState] ADD CONSTRAINT [SimulationState_source_df] DEFAULT 'tracking-demo-simulation' FOR [source];

-- AlterTable
ALTER TABLE [dbo].[TruckTelemetry] DROP CONSTRAINT [TruckTelemetry_destinationZone_df];
ALTER TABLE [dbo].[TruckTelemetry] ADD CONSTRAINT [TruckTelemetry_destinationZone_df] DEFAULT 'loading-zone' FOR [destinationZone];

-- AddForeignKey
ALTER TABLE [dbo].[TruckTelemetry] ADD CONSTRAINT [TruckTelemetry_truckId_fkey] FOREIGN KEY ([truckId]) REFERENCES [dbo].[Truck]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
