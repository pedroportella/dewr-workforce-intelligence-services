# DEWR Workforce Intelligence Services

REST API prototype for DEWR workforce intelligence.

## Endpoints

- `GET /health`
- `GET /api/v1/workforce-intelligence/pathways/dataset`
- `GET /api/v1/workforce-intelligence/events`
- `POST /api/v1/workforce-intelligence/events`

## Architecture

The service uses controller/routes, application service and repository boundaries that mirror a .NET
Web API architecture. The runtime repository is in-memory for prototype speed, while Prisma keeps
the SQL Server persistence contract concrete through:

- `prisma/schema.prisma`
- `prisma/migrations/20260508000000_init_workforce_intelligence/migration.sql`
- `src/db.ts`
- `src/seed.ts`

## Run

```bash
pnpm install
pnpm prisma:generate
pnpm start
pnpm test
```

Use `pnpm prisma:migrate` and `pnpm seed` when a SQL Server `DATABASE_URL` is available.
