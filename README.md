# DEWR Workforce Intelligence Services

REST API prototype for DEWR workforce intelligence.

## Architecture

The service uses controller/routes, application service and repository boundaries that mirror a .NET
Web API architecture. The runtime repository is in-memory for prototype speed, while Prisma keeps
the SQL Server persistence contract concrete through:

- `prisma/schema.prisma`
- `prisma/migrations/20260508000000_init_workforce_intelligence/migration.sql`
- `src/db.ts`
- `src/seed.ts`

## Endpoints

- `GET /health` — Service health check
- `GET /api/v1/workforce-intelligence/pathways/dataset` — Retrieve workforce pathways dataset
- `GET /api/v1/workforce-intelligence/events` — List events
- `POST /api/v1/workforce-intelligence/events` — Ingest workforce events

## Local Setup

### Prerequisites

- **Node.js 24+** — Runtime environment
- **pnpm 9+** — Package manager (managed via Corepack)
- **SQL Server** (optional) — Required only for full database persistence testing

### Installation

```bash
# Install dependencies using pnpm
pnpm install

# Generate Prisma client
pnpm prisma:generate
```

### Running Locally

**In-memory mode (no database required):**

```bash
# Start the development server
pnpm dev

# Run contract tests (validates service logic)
pnpm test

# Type check
pnpm typecheck
```

The in-memory repository means you can run the full service and test suite without a database connection. The `DATABASE_URL` environment variable is optional for this mode.

**With SQL Server persistence:**

If you have a SQL Server instance running, configure the connection string:

```bash
# Update .env with your SQL Server connection
DATABASE_URL="sqlserver://localhost:1433;database=your_db;user=sa;password=Your_strong_Passw0rd!;encrypt=true;trustServerCertificate=true"

# Generate migrations and seed data
pnpm prisma:migrate
pnpm seed

# View the database schema in Prisma Studio
pnpm prisma:studio
```

## Database

### Schema & Migrations

- **Provider:** SQL Server
- **Schema:** [prisma/schema.prisma](prisma/schema.prisma)
- **Migration:** [prisma/migrations/20260508000000_init_workforce_intelligence/migration.sql](prisma/migrations/20260508000000_init_workforce_intelligence/migration.sql)

### Tables

- `WorkforceRegion` — Regional workforce data (SA4 level)
- `WorkforceMetricSnapshot` — Point-in-time metric observations
- `WorkforceEventInbox` — Ingested workforce events

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration. The workflow runs on every push to `main` and on all pull requests.

### Workflow: `ci.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch  
- Manual trigger via `workflow_dispatch`

**Steps:**
1. **Checkout** — Clone repository
2. **Setup Node.js 24** — Configure runtime environment
3. **Setup pnpm** — Enable Corepack and install pnpm
4. **Install dependencies** — Run `pnpm install --frozen-lockfile`
5. **Generate Prisma client** — Run `pnpm prisma:generate`
6. **Type check** — Run `pnpm typecheck` (validates TypeScript without emitting)
7. **Test** — Run `pnpm test` (contract tests)

All steps must pass for the workflow to succeed. Failed type checks or test failures will block PR merges.

## npm Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with hot reload (`tsx watch`) |
| `start` | Start the application in production mode |
| `test` | Run contract tests that validate service boundaries |
| `typecheck` | TypeScript type checking without emitting files |
| `prisma:generate` | Generate Prisma client from schema |
| `prisma:migrate` | Run pending migrations (requires SQL Server) |
| `seed` | Populate database with sample data (requires SQL Server) |
| `prisma:studio` | Open Prisma Studio to browse data (requires SQL Server) |

## Troubleshooting

### Prisma Client Generation Fails

Ensure you have the latest schema:

```bash
pnpm prisma:generate
```

### Tests Fail Locally but Pass in CI

The tests use in-memory state. Ensure you're starting fresh:

```bash
# Restart the process to clear in-memory state
pnpm test
```

### Type Errors in IDE

Regenerate the Prisma client and run type check:

```bash
pnpm prisma:generate
pnpm typecheck
```

### Database Connection Issues (with SQL Server)

- Verify `DATABASE_URL` in `.env` is correct
- Ensure SQL Server instance is running and accessible
- Check that the database user has appropriate permissions
- Run migrations: `pnpm prisma:migrate`
