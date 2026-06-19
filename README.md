# Nest Hex Backend

Enterprise-grade NestJS boilerplate built for DDD and Hexagonal Architecture with MongoDB, Redis, BullMQ, and AWS S3. This stack enforces strict domain boundaries, resilient distributed workflows, and production-grade operational features.

## Architecture Principles

- **Pure Domain Layer**: No framework decorators or external dependencies.
- **Ports and Adapters**: Strict inbound/outbound boundaries.
- **Outbox Pattern**: Atomic DB changes + async side-effects.
- **Idempotency First**: Safe writes under retries and network flakiness.
- **RFC-7807 Errors**: Standardized Problem Details.

## Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 Inbound Adapters                                  |
|                         (HTTP Controllers, DTOs, Guards)                          |
+------------------------------+---------------------+------------------------------+
                               |                     |
                               v                     v
+-----------------------------------------------------------------------------------+
|                               Application Services                                |
|                    (Use Cases, Orchestration, UoW)                                |
+-----------------------------------------------------------------------------------+
                               |                     |
                               v                     v
+-----------------------------------------------------------------------------------+
|                                   Domain Layer                                    |
|                        (Entities, Value Objects, Exceptions)                      |
+-----------------------------------------------------------------------------------+
                               |                     |
                               v                     v
+-----------------------------------------------------------------------------------+
|                                 Outbound Ports                                    |
|                     (Repositories, Queue, Storage, Auth)                          |
+------------------------------+---------------------+------------------------------+
                               |                     |
                               v                     v
+-----------------------------------------------------------------------------------+
|                                 Outbound Adapters                                 |
|              (Mongo/Mongoose, Redis, BullMQ, S3, SMTP, JWT)                       |
+-----------------------------------------------------------------------------------+

+---------------------------+         +--------------------------+
|     Transactional UoW     |         |     Outbox Dispatcher     |
| (MongoDB Session/Txn)     |         | (Async side-effects)      |
+---------------------------+         +--------------------------+
```

## API Versioning

All routes are prefixed with `/api/v1`. Update `API_REFERENCE_PATH` and `OPENAPI_JSON_PATH` if you change the prefix.

## Core Enterprise Features

- **Transactional Outbox** for MongoDB + S3 + BullMQ atomicity.
- **JWT Auth** with refresh token rotation and revocation.
- **Email Verification** using OTP + token flow.
- **Rate limiting + Lockout** using Redis counters.
- **HATEOAS Envelope** across application endpoints.
- **Health Checks** (Mongo, Redis, S3, BullMQ).
- **Metrics** via Prometheus-compatible endpoint.
- **Tracing** via OpenTelemetry (OTLP HTTP).
- **Graceful Shutdown** for BullMQ workers + Redis + Mongo.

## Directory Layout

```
src/
+-- app.module.ts
+-- main.ts
+-- common/
¦   +-- filters/
¦   +-- interceptors/
¦   +-- ports/
¦   +-- providers/
¦   +-- health/
¦   +-- metrics/
¦   +-- hateoas/
+-- modules/
    +-- orders/
    +-- users/
    +-- auth/
```

## Authentication Flow

1. **Register**: `POST /api/v1/auth/register`
2. **Verify Email**: `POST /api/v1/auth/verify-email` with OTP + token
3. **Login**: `POST /api/v1/auth/login` returns access + refresh token
4. **Refresh**: `POST /api/v1/auth/refresh` rotates refresh token
5. **Logout**: `POST /api/v1/auth/logout` revokes refresh token

## HATEOAS Response Envelope

All business endpoints respond with:

```
{
  "data": { ... },
  "links": [
    { "rel": "self", "href": "/api/v1/...", "method": "GET" }
  ],
  "meta": { ... }
}
```

## Health & Metrics

- Liveness: `GET /api/v1/health/live`
- Readiness: `GET /api/v1/health/ready`
- Metrics: `GET /api/v1/metrics`

## Tracing (OpenTelemetry)

Enable tracing with:

- `OTEL_ENABLED=true`
- `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318/v1/traces`
- `SERVICE_NAME=nest-hex-backend`

## API Docs (Scalar)

- OpenAPI: `OPENAPI_JSON_PATH` (default `/api/v1/openapi.json`)
- Scalar: `API_REFERENCE_PATH` (default `/api/v1/reference`)
- Basic auth uses `SCALAR_USERNAME` and `SCALAR_PASSWORD`

## Local Setup

1. Copy environment template:

```
cp .env.example .env
```

2. Install dependencies:

```
npm install
```

3. Start services and the API:

```
npm run start:dev
```

## CI/CD & Security

- GitHub Actions workflow under `.github/workflows/ci.yml`
- `npm audit` runs on CI

## Migrations & Seeds

- `scripts/migrate.ts`: placeholder for schema migrations
- `scripts/seed.ts`: example seed script

## Notes

- MongoDB transactions require a **replica set** or **sharded cluster**.
- For browser clients using cookies, add CSRF protection.
- Update password policies and breached-password checks as needed for your org.
