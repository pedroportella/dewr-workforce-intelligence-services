# DEWR Workforce Intelligence Services

REST API prototype refactored from the tracking services base into a workforce intelligence backend.

## Endpoints

- `GET /health`
- `GET /api/v1/workforce-intelligence/pathways/dataset`
- `GET /api/v1/workforce-intelligence/events`
- `POST /api/v1/workforce-intelligence/events`

## Architecture

The service uses controller/routes, application service and repository boundaries that mirror a .NET
Web API architecture. The repository is in-memory for prototype speed, while `prisma/schema.prisma`
and `docs/SQL-SERVER-PERSISTENCE.md` define SQL Server-style persistence models.

## Run

```bash
pnpm install
pnpm start
pnpm test
```
