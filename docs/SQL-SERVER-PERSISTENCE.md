# SQL Server-style persistence model

The prototype service keeps an in-memory repository for local delivery speed, but the application
shape follows a Web API and SQL Server persistence boundary.

## Tables

- `WorkforceRegion`: `RegionId` PK, `DisplayName`, `State`, `PrimaryIndustry`, `Cohort`, `UpdatedAt`.
- `WorkforceMetricSnapshot`: `SnapshotId` PK, `RegionId` FK, `EmploymentRatePercent`, `Vacancies`,
  `SkillsGapIndex`, `TrainingCompletions`, `SustainedOutcomeRatePercent`, `ParticipantCount`, `ObservedAt`.
- `WorkforceEventInbox`: `EventId` PK, `EventType`, `RegionId`, `OccurredAt`, `PayloadJson`, `ProcessedAt`.
- `PathwayScenario`: `ScenarioId` PK, `DisplayName`, `Summary`, `HorizonQuarter`.

## API boundary

- `GET /health`
- `GET /api/v1/workforce-intelligence/pathways/dataset`
- `GET /api/v1/workforce-intelligence/events`
- `POST /api/v1/workforce-intelligence/events`

The repository can be replaced by an EF Core or Prisma SQL Server adapter without changing the
controller route contracts.
