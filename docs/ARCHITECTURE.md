# Veloce Monorepo Architecture

## Overview

Veloce is a dealership CRM and public storefront structured as an npm workspaces monorepo. The system exposes a Next.js storefront backed by an Express.js API bridge, which in turn communicates with a headless Frappe ERP instance for data persistence.

---

## Repository Layout

```
/
├── apps/
│   ├── api/                          # REST bridge (@veloce/api)
│   │   ├── src/
│   │   │   ├── controllers/          # HTTP request handling, Zod validation
│   │   │   ├── services/             # Business logic, Frappe API calls
│   │   │   ├── routes/               # Express Router definitions
│   │   │   ├── frappe/               # Frappe Axios client
│   │   │   ├── middleware/           # Global error handler
│   │   │   └── utils/                # Logger, sanitizer
│   │   └── scripts/
│   │       ├── init-production-db.py # DocType initialization (idempotent)
│   │       └── archive/              # Superseded migration scripts
│   └── web/                          # Next.js storefront (@veloce/web)
│       └── src/
│           ├── app/                  # App Router pages
│           ├── components/           # UI components
│           ├── hooks/                # Data and animation hooks
│           └── lib/                  # API client, Lenis store
├── packages/
│   └── shared/                       # @veloce/shared
│       └── src/
│           ├── schemas/              # Zod schemas (lead, vehicle)
│           └── types/                # TypeScript entity interfaces
├── docs/
│   ├── API.md                        # Endpoint reference
│   └── ARCHITECTURE.md               # This file
└── infra/
    └── local-dev/                    # Local development infrastructure only
        ├── docker-compose.yml        # Full Frappe ERP stack definition
        └── create-site.sh            # One-time site provisioning script
```

---

## Technology Stack

| Component   | Technology                          | Notes                                          |
| ----------- | ----------------------------------- | ---------------------------------------------- |
| Storefront  | Next.js 15, App Router, Tailwind 4  | GSAP animations, Lenis smooth scroll           |
| API Bridge  | Express.js, TypeScript (NodeNext)   | Zod validation, Axios Frappe client            |
| Data Engine | Frappe ERPNext v16 (Docker)         | Headless; accessed via REST API + API key auth |
| Database    | MariaDB 11.8                        | Managed by Frappe inside Docker                |
| Cache/Queue | Redis 6.2                           | Frappe job queue and cache                     |
| Shared      | @veloce/shared                      | Zod schemas imported by api only (see below)   |

---

## Request Flow

```
Browser
  |
  | HTTPS / HTTP port 3001 (dev)
  v
apps/web                     Next.js App Router
  |
  | HTTP port 3000 (server-side or client-side)
  v
apps/api                     Express.js API Bridge
  |
  | HTTP port 8080 — API key authentication
  v
Frappe ERP                   Headless data engine
  |
  v
MariaDB 11                   Persistent storage
```

---

## API Layer (apps/api)

The bridge follows a strict three-layer pattern: Routes -> Controllers -> Services.

### Layer Responsibilities

| Layer          | Location                          | Responsibility                                              |
| -------------- | --------------------------------- | ----------------------------------------------------------- |
| Routes         | `src/routes/`                     | HTTP method binding, route-level middleware                 |
| Controllers    | `src/controllers/[entity]/`       | Request parsing, Zod validation, response formatting        |
| Services       | `src/services/[entity]/`          | Frappe API calls, data transformation, error propagation    |
| Frappe Client  | `src/frappe/frappeClient.ts`      | Axios instance with API key/secret authorization header     |

### Entities and Routes

| Entity            | Methods                    | Frappe DocType       |
| ----------------- | -------------------------- | -------------------- |
| Vehicle Inventory | GET /api/vehicles          | Vehicle Inventory    |
|                   | GET /api/vehicles/:id      |                      |
| Lead              | POST /api/leads            | Lead                 |
| Payment           | CRUD /api/payments         | Payment              |

### Authentication

The bridge authenticates to Frappe using token-based API key authentication. The `Authorization: token <key>:<secret>` header is appended by `frappeClient.ts` to all outbound Frappe requests. Inbound requests from the storefront are unauthenticated; the leads endpoint is intentionally public.

---

## Shared Package (packages/shared)

`@veloce/shared` exports Zod schemas and TypeScript interfaces using NodeNext module resolution (`.js` extensions in import paths).

**Critical constraint:** Turbopack (used by `apps/web`) cannot resolve `.js` to `.ts` transitive imports from `@veloce/shared`. Client and server components in `apps/web` must not import from `@veloce/shared`. Use `zod` directly in `apps/web` and duplicate schema definitions if needed at the boundary.

`apps/api` imports from `@veloce/shared` safely via `ts-node` with `tsc-paths`.

---

## Frappe DocTypes

Two custom DocTypes are required. They are created and synchronized by `apps/api/scripts/init-production-db.py` (idempotent).

### Vehicle Inventory

| Field        | Type          | Required |
| ------------ | ------------- | -------- |
| make         | Data          | Yes      |
| model        | Data          | Yes      |
| year         | Int           | Yes      |
| color        | Data          | Yes      |
| thumbnail    | Attach Image  | Yes      |
| image_1..10  | Attach Image  | No       |
| vin          | Data          | No       |
| mileage      | Float         | No       |
| price        | Currency      | No       |
| description  | Text          | No       |
| status       | Select        | Yes      |

Status options: `Available`, `Sold`.

### Lead

| Field               | Type       | Required |
| ------------------- | ---------- | -------- |
| first_name          | Data       | Yes      |
| last_name           | Data       | Yes      |
| email               | Data       | Yes      |
| phone               | Data       | Yes      |
| message             | Long Text  | Yes      |
| vehicle_properties  | Data       | Yes      |
| status              | Select     | No       |

`vehicle_properties` stores a denormalized descriptor in the format `"Color Make Model Year"` (e.g. `"Shark Blue Porsche 911 GT3 2023"`). This avoids a secondary vehicle lookup during lead creation.

Status options: `New`, `Contacted`.

---

## Media Protocol

Frappe manages asset storage via Docker volumes. The `thumbnail` field is mandatory and used for inventory listing cards and the featured vehicles carousel. Fields `image_1` through `image_10` are optional high-resolution gallery assets served from the same Frappe volume.

In local development, media is served through the Frappe Nginx proxy at `http://localhost:8080`. The Next.js `next.config.ts` includes a `remotePatterns` entry for `localhost:8080` to allow `next/image` optimization.

---

## Local Infrastructure (infra/local-dev)

The Docker Compose stack in `infra/local-dev/` runs the full Frappe ERP locally. It is not used in production deployments.

### Services

| Service        | Image                        | Role                            |
| -------------- | ---------------------------- | ------------------------------- |
| db             | mariadb:11.8                 | Primary database                |
| redis-cache    | redis:6.2-alpine             | Frappe cache layer              |
| redis-queue    | redis:6.2-alpine             | Frappe job queue                |
| configurator   | frappe/erpnext:v16.9.0       | One-shot bench config writer    |
| backend        | frappe/erpnext:v16.9.0       | Gunicorn application server     |
| websocket      | frappe/erpnext:v16.9.0       | Node.js Socket.IO server        |
| queue-short    | frappe/erpnext:v16.9.0       | Short/default queue worker      |
| queue-long     | frappe/erpnext:v16.9.0       | Long/default queue worker       |
| scheduler      | frappe/erpnext:v16.9.0       | Frappe scheduled tasks          |
| frontend       | frappe/erpnext:v16.9.0       | Nginx reverse proxy (port 8080) |

All Frappe services use `platform: linux/amd64` for Rosetta 2 compatibility on Apple Silicon.
