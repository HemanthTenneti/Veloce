# Veloce Dealership CRM

A full-stack monorepo CRM and public storefront for a premium automobile dealership. The system exposes a public vehicle inventory browser and enquiry form backed by a headless Frappe ERP instance.

## Repository Structure

```
/
├── apps/
│   ├── api/           # Express.js REST bridge (@veloce/api)
│   └── web/           # Next.js storefront (@veloce/web)
├── docs/
│   ├── assets/        # Screenshots and visual documentation
│   ├── API.md         # Endpoint reference
│   └── ARCHITECTURE.md# System architecture
├── packages/
│   └── shared/        # Zod schemas and TypeScript interfaces (@veloce/shared)
├── infra/
│   └── local-dev/     # Docker Compose stack for local development only
└── .ai-workflow/      # Development workflow specs and Playwright test suites
```

## Technology Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Storefront  | Next.js 15 (App Router), GSAP, Lenis, Tailwind 4    |
| API Bridge  | Express.js, TypeScript (NodeNext module resolution) |
| Validation  | Zod (shared schemas via @veloce/shared)             |
| Data Engine | Frappe ERPNext v16 (Dockerized, headless)           |
| Database    | MariaDB 11.8                                        |

---

## V4 Architecture

Veloce is structured as a three-workspace monorepo. Each workspace has a single, well-bounded responsibility; there are no circular dependencies.

```
@veloce/shared  ←  imported by both
      ↑                  ↑
@veloce/api         @veloce/web
(Express bridge)    (Next.js storefront)
```

### Layer Responsibilities

| Layer | Package | Role |
| --- | --- | --- |
| **Storefront** | `@veloce/web` | Next.js 15 App Router with `[locale]` dynamic segment. Handles all rendering, i18n, image optimization (`next/image`), and GSAP animation. Built with `output: "standalone"` for minimal Docker images. |
| **API Bridge** | `@veloce/api` | Thin Express.js adapter. Translates REST requests from the storefront into authenticated Frappe REST API calls. Owns no business logic; all validation delegates to `@veloce/shared`. |
| **Schema Layer** | `@veloce/shared` | Zod schemas and TypeScript interfaces shared across both apps. Uses NodeNext module resolution with `.js` extensions internally. Do not import from this package in Next.js client components (Turbopack cannot resolve NodeNext transitive imports). |
| **Data Engine** | Frappe 16 | Vanilla Frappe (not ERPNext) running in Docker. Owns the `Vehicle Inventory` custom DocType and a `Lead` DocType with Veloce-specific custom fields (`vehicle_properties`, `message`). Exposed on port 8080 behind Nginx. |

### Request Flow

```
Browser → Next.js (3000) → Express Bridge (5005) → Frappe REST (8080) → MariaDB
```

The storefront never calls Frappe directly. All Frappe credentials are scoped to the API bridge environment.

---

## i18n Localization Strategy

Veloce supports English and Spanish through **next-intl v4.8.3** with a `localePrefix: "as-needed"` routing policy. English content is served at the root path (`/`); Spanish content is served under the `/es/` prefix.

### Routing

| Locale | Path prefix | Example |
| --- | --- | --- |
| `en` (default) | none | `/`, `/inventory` |
| `es` | `/es` | `/es`, `/es/inventory` |

The `[locale]` dynamic segment in `apps/web/src/app/[locale]/` drives all page rendering. The middleware at `apps/web/src/middleware.ts` negotiates the locale from the `Accept-Language` header and redirects accordingly.

### Message Catalogs

All UI strings are externalized into `apps/web/messages/en.json` and `apps/web/messages/es.json`. Both files define **14 namespaces**:

`Metadata` · `Nav` · `Hero` · `FeaturedVehicles` · `InventoryCTA` · `HowItWorks` · `ReserveCTA` · `Footer` · `InventoryPage` · `FilterBar` · `VehicleGrid` · `EnquiryModal` · `Status` · `Errors`

### Invariant Data

Make, Model, VIN, year, and numeric mileage are never translated. Only UI labels, status badges, and error messages are pulled from the message catalog.

### Key Implementation Details

- **`translateStatus()`** in `VehicleGrid.tsx` maps `AVAILABLE / SOLD / RESERVED` enum values to the locale-appropriate `Status.*` keys.
- **Zod validation errors** in `EnquiryModal.tsx` are emitted as translation keys and resolved via a `te(key)` helper, keeping the error boundary consistent across locales.
- **Language switcher** is rendered separately in mobile and desktop nav slots. Playwright tests target `.hidden.md\\:block` for the desktop switcher.
- **Google Translate suppression**: The `<html translate="no">` attribute and `<meta name="google" content="notranslate">` injected via Next.js Metadata prevent the browser's native translation popup from interfering with the built-in i18n system.

---

## Port Assignments

| Service       | Port | Notes                              |
| ------------- | ---- | ---------------------------------- |
| Frappe ERP    | 8080 | Nginx proxy in front of Gunicorn   |
| Express API   | 5005 | Set via `PORT` in `apps/api/.env`  |
| Next.js Web   | 3000 | Default `next dev` / `next start`  |

## Prerequisites

- Node.js 22+
- npm 10+
- Docker Desktop 4.x
- Python 3 (available inside the Frappe Docker container; no local install required)

---

## Production Pipeline

Complete sequence for a clean deployment from repository checkout to running application.

### Step 1. Install Node dependencies

Run this once from the repository root. All workspaces are installed in a single pass.

```bash
npm install
```

### Step 2. Start the Frappe infrastructure

```bash
cd infra/local-dev
docker compose up -d
```

Wait for all containers to report healthy before proceeding. Verify with:

```bash
docker compose ps
```

All services (db, redis-cache, redis-queue, configurator, backend, websocket, frontend) must be running or completed.

### Step 3. Provision the Frappe site (first time only)

```bash
cd infra/local-dev
./create-site.sh
```

This script creates the Frappe site, enables CORS, runs the initial migration, and prints the Administrator credentials. It must complete without errors before proceeding. Skip this step on subsequent runs against an existing volume.

### Step 4. Initialize DocTypes

Copy the initializer script into the running backend container and execute it via `bench`. Run these three commands from the repository root.

```bash
docker compose -f infra/local-dev/docker-compose.yml cp \
  apps/api/scripts/init-production-db.py \
  backend:/home/frappe/frappe-bench/apps/frappe/frappe/init_production_db.py

docker compose -f infra/local-dev/docker-compose.yml exec backend \
  bench --site localhost execute frappe.init_production_db.run_from_bench

docker compose -f infra/local-dev/docker-compose.yml exec backend \
  bench --site localhost migrate
```

The initializer script performs the following actions:

1. Creates the `Vehicle Inventory` DocType as a custom module and physically materializes the MariaDB table by calling `frappe.db.commit()` immediately after `doc.insert()` followed by `frappe.db.updatedb()`.
2. Adds Veloce-specific custom fields (`vehicle_properties`, `message`) to the built-in ERPNext `Lead` DocType using the Frappe Custom Field API. Each field is committed individually so the column is present before the next operation begins.
3. Prints a verification report confirming all expected fields exist in the database.
4. The subsequent `bench migrate` finalizes any pending schema changes and is required before the API bridge starts.

Expected output (abbreviated):

```
----------------------------------------------------------------------
Veloce - Production DocType Initializer
----------------------------------------------------------------------
CREATE 'Vehicle Inventory' -> [make, model, year, color, thumbnail, image_1, ..., status]
CREATE Custom Field 'Lead.vehicle_properties'
CREATE Custom Field 'Lead.message'

----------------------------------------------------------------------
DB committed. Running field verification...
----------------------------------------------------------------------
VERIFY 'Vehicle Inventory' OK  [make, model, year, color, thumbnail, ...]
VERIFY Lead custom fields OK  [message, vehicle_properties]
```

### Step 5. Configure the API bridge

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and populate the Frappe credentials:

```env
NODE_ENV=production
PORT=5005
HOST=localhost
LOG_LEVEL=info
CORS_ORIGIN=*
FRAPPE_URL=http://localhost:8080
FRAPPE_API_KEY=<generated in Frappe UI>
FRAPPE_API_SECRET=<generated in Frappe UI>
```

API keys are generated in Frappe under: Settings > My Profile > API Access > Generate Keys.

### Step 6. Start the application

Start the Express API bridge and the Next.js storefront concurrently:

```bash
npm run dev
```

This runs:
- `apps/api` on port **5005** (reads `PORT` from `apps/api/.env`)
- `apps/web` on port **3000** (`next dev` default)

To start each service individually:

```bash
npm run dev:api   # Express API on port 5005
npm run dev:web   # Next.js storefront on port 3000
```

For a production process (no file watching):

```bash
# API bridge
npm run prod -w @veloce/api

# Next.js (build first, then serve)
npm run build -w @veloce/web
npm run start -w @veloce/web
```

### Step 7. Seed demo vehicle data

The seed images ship in the repository under `apps/api/scripts/seed-assets/`. Push them into the Frappe public files directory once, then run the seeder.

```bash
# Deploy images into Frappe (run once)
for f in c1 c2 c3 c4; do
  docker cp apps/api/scripts/seed-assets/${f}.jpg \
    veloce-engine-backend-1:/home/frappe/frappe-bench/sites/localhost/public/files/${f}.jpg
done

# Copy and execute the seed script
docker cp apps/api/scripts/seed-vehicles.py \
  veloce-engine-backend-1:/home/frappe/frappe-bench/apps/frappe/frappe/seed_vehicles.py

docker exec -w /home/frappe/frappe-bench veloce-engine-backend-1 \
  bench --site localhost execute frappe.seed_vehicles.run_from_bench
```

The script wipes all existing Vehicle Inventory records, then inserts 9 vehicles. Thumbnails and gallery slots cycle through `c1.jpg`–`c4.jpg`. Running it again on an already-seeded site is safe: it performs a full wipe and re-insert, not an upsert.

Expected output:

```
----------------------------------------------------------------------
Veloce - Vehicle Seed  (local images: c1-c4)
----------------------------------------------------------------------
Wiped 0 existing Vehicle Inventory records.

SEED  PORSCHE 911 GT3 Touring 2023  thumbnail=/files/c1.jpg  color=Guards Red  id=...
...
SEED  RIVIAN R1S Launch Edition 2023  thumbnail=/files/c1.jpg  color=Launch Green  id=...

----------------------------------------------------------------------
Done. Total Vehicle Inventory records: 9
----------------------------------------------------------------------
```

### Step 8. Verify the deployment

| Check                          | Command / URL                              |
| ------------------------------ | ------------------------------------------ |
| Frappe Desk                    | http://localhost:8080                      |
| Vehicle Inventory DocType      | http://localhost:8080/app/vehicle-inventory|
| API health check               | http://localhost:5005/api/health           |
| Storefront                     | http://localhost:3000                      |

Confirm the `Vehicle Inventory` DocType exists in Frappe Desk and that the 9 seeded vehicles appear without SQL errors.

---

## Docker Production Notes

The Next.js storefront is configured with `output: "standalone"` in `apps/web/next.config.ts`. This produces a self-contained build artifact under `apps/web/.next/standalone/` that includes only the Node.js files required to run the server — no `node_modules` copy, no source files.

### Standalone build structure

```
apps/web/.next/standalone/
├── apps/web/server.js          # Entry point: node server.js
└── node_modules/               # Pruned production deps only
```

Static assets must be copied from the build output before running the container:

```bash
# Build the storefront
npm run build -w @veloce/web

# Copy static assets into the standalone tree
cp -r apps/web/.next/static    apps/web/.next/standalone/apps/web/.next/static
cp -r apps/web/public          apps/web/.next/standalone/apps/web/public

# Run the standalone server
node apps/web/.next/standalone/apps/web/server.js
```

### .dockerignore coverage

Root, `apps/web/`, and `apps/api/` each carry a `.dockerignore` that excludes `node_modules/`, `.next/`, `.env`, `test-results/`, and `coverage/` from the Docker build context, keeping image layers minimal.

### API bridge container

The Express bridge has no special build step. A minimal production Dockerfile copies `apps/api/dist/` (from `npm run build`) and runs `node dist/index.js`. The `removeComments: true` flag in `apps/api/tsconfig.json` strips all source comments from the emitted JavaScript.

---

## Local Development Setup

For iterative development the pipeline is identical to the production pipeline above. Use `npm run dev` (Step 6) which enables hot-reloading on both the API and the storefront.

---

## API Reference

See [docs/API.md](docs/API.md) for endpoint documentation.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design and architectural decisions.
