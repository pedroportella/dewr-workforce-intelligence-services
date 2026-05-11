# DEWR Workforce Intelligence Services

REST API prototype for DEWR workforce intelligence, regional pathway metrics and event ingestion.

## What it demonstrates

- Express REST API shaped around controller, route, service and repository boundaries.
- SQL Server persistence contract represented with Prisma schema and migrations.
- In-memory runtime repository for fast local review without a database dependency.
- Contract tests for the workforce dataset and event ingestion boundary.
- Docker and CI evidence for repeatable delivery.

## Architecture

The service mirrors a .NET Web API style boundary:

- `src/server.ts`: application entrypoint.
- `src/app.ts`: Express app, middleware and route registration.
- `src/modules/workforce`: workforce routes, service, repository and DTO types.
- `prisma/schema.prisma`: SQL Server persistence model.
- `prisma/migrations/20260508000000_init_workforce_intelligence/migration.sql`: database migration.
- `src/db.ts` and `src/seed.ts`: Prisma client and seed workflow.

## Prerequisites

- Node.js 20.19+
- pnpm 8.15.5, managed via Corepack
- Docker, for container review
- SQL Server, optional and only required for persistence testing

## Local setup

```bash
pnpm install
pnpm prisma:generate
pnpm dev
```

The service runs at `http://localhost:4000`.

Useful local checks:

```bash
pnpm test
pnpm typecheck
pnpm build
```

The default runtime is in-memory, so `DATABASE_URL` is not required for local service review or tests.

## Docker

```bash
docker build -t dewr-workforce-intelligence-services:local .
docker run --rm -p 4000:4000 dewr-workforce-intelligence-services:local
```

Container URL: `http://localhost:4000`.

## Endpoints

- `GET /health`: service health check.
- `GET /api/v1/workforce-intelligence/pathways/dataset`: retrieve workforce pathways dataset.
- `GET /api/v1/workforce-intelligence/events`: list recent events.
- `POST /api/v1/workforce-intelligence/events`: ingest workforce events.

## Configuration

For SQL Server persistence testing, create `.env` with:

```bash
DATABASE_URL="sqlserver://localhost:1433;database=your_db;user=sa;password=Your_strong_Passw0rd!;encrypt=true;trustServerCertificate=true"
```

Then run:

```bash
pnpm prisma:migrate
pnpm seed
pnpm prisma:studio
```

## CI / GitHub Actions

`.github/workflows/ci.yml` runs on pushes to `main`, pull requests to `main`, and manual dispatch.

The workflow uses Node.js 20.19.0 and Corepack-managed `pnpm@8.15.5`, then runs:

- `pnpm install --frozen-lockfile`
- `pnpm prisma:generate`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- Docker image build as `dewr-workforce-intelligence-services:ci`

## npm scripts

| Script | Description |
| --- | --- |
| `dev` | Start development server with hot reload |
| `build` | Compile TypeScript into `dist` |
| `start` | Start the compiled production server |
| `test` | Run service contract tests |
| `typecheck` | Type-check without emitting files |
| `prisma:generate` | Generate Prisma client |
| `prisma:migrate` | Run migrations against SQL Server |
| `seed` | Seed SQL Server sample data |
| `prisma:studio` | Open Prisma Studio |

## Troubleshooting

- Regenerate Prisma client with `pnpm prisma:generate` if IDE types look stale.
- Restart the service to clear in-memory state during manual testing.
- For SQL Server issues, verify `DATABASE_URL`, database access and migrations.
