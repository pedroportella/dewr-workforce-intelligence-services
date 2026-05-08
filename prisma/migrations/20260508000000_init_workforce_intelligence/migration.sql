CREATE TABLE [dbo].[WorkforceRegion] (
    [regionId] NVARCHAR(100) NOT NULL,
    [displayName] NVARCHAR(200) NOT NULL,
    [state] NVARCHAR(20) NOT NULL,
    [primaryIndustry] NVARCHAR(200) NOT NULL,
    [cohort] NVARCHAR(80) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [WorkforceRegion_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [WorkforceRegion_pkey] PRIMARY KEY CLUSTERED ([regionId])
);

CREATE TABLE [dbo].[WorkforceMetricSnapshot] (
    [snapshotId] NVARCHAR(100) NOT NULL,
    [regionId] NVARCHAR(100) NOT NULL,
    [employmentRatePercent] FLOAT(53) NOT NULL,
    [vacancies] INT NOT NULL,
    [skillsGapIndex] INT NOT NULL,
    [trainingCompletions] INT NOT NULL,
    [sustainedOutcomeRatePercent] FLOAT(53) NOT NULL,
    [participantCount] INT NOT NULL,
    [observedAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [WorkforceMetricSnapshot_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [WorkforceMetricSnapshot_pkey] PRIMARY KEY CLUSTERED ([snapshotId])
);

CREATE TABLE [dbo].[WorkforceEventInbox] (
    [eventId] NVARCHAR(100) NOT NULL,
    [eventType] NVARCHAR(120) NOT NULL,
    [regionId] NVARCHAR(100) NOT NULL,
    [occurredAt] DATETIME2 NOT NULL,
    [payloadJson] NVARCHAR(MAX) NOT NULL,
    [processedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [WorkforceEventInbox_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [WorkforceEventInbox_pkey] PRIMARY KEY CLUSTERED ([eventId])
);

CREATE TABLE [dbo].[PathwayScenario] (
    [scenarioId] NVARCHAR(100) NOT NULL,
    [displayName] NVARCHAR(200) NOT NULL,
    [summary] NVARCHAR(2000) NOT NULL,
    [horizonQuarter] NVARCHAR(40) NOT NULL,
    CONSTRAINT [PathwayScenario_pkey] PRIMARY KEY CLUSTERED ([scenarioId])
);

CREATE NONCLUSTERED INDEX [WorkforceMetricSnapshot_regionId_observedAt_idx]
    ON [dbo].[WorkforceMetricSnapshot]([regionId], [observedAt]);

CREATE NONCLUSTERED INDEX [WorkforceEventInbox_eventType_occurredAt_idx]
    ON [dbo].[WorkforceEventInbox]([eventType], [occurredAt]);

ALTER TABLE [dbo].[WorkforceMetricSnapshot]
    ADD CONSTRAINT [WorkforceMetricSnapshot_regionId_fkey]
    FOREIGN KEY ([regionId]) REFERENCES [dbo].[WorkforceRegion]([regionId])
    ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE [dbo].[WorkforceEventInbox]
    ADD CONSTRAINT [WorkforceEventInbox_regionId_fkey]
    FOREIGN KEY ([regionId]) REFERENCES [dbo].[WorkforceRegion]([regionId])
    ON DELETE NO ACTION ON UPDATE CASCADE;
