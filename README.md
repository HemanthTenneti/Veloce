# Veloce Dealership CRM

A full-stack monorepo CRM and public storefront for a premium automobile dealership. The system exposes a public vehicle inventory browser and enquiry form backed by a headless Frappe ERP instance.

## Repository Structure

```
/
├── apps/
│   ├── api/           # Express.js REST bridge (@veloce/api)
│   └── web/           # Next.js storefront (@veloce/web)
├── docs/
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

## Prerequisites

- Node.js 22+
- npm 10+
- Docker Desktop 4.x

## Local Development Setup

### 1. Start the Frappe infrastructure

```bash
cd infra/local-dev
docker compose up -d
```

### 2. Provision the Frappe site (first time only)

```bash
cd infra/local-dev
./create-site.sh
```

This script creates the Frappe site, enables CORS, runs the initial migration, and prints credentials. It must complete successfully before proceeding.

### 3. Initialize DocTypes

Copy the initialization script into the running Frappe container and execute it from the repository root:

```bash
docker compose -f infra/local-dev/docker-compose.yml cp \
  apps/api/scripts/init-production-db.py \
  backend:/home/frappe/frappe-bench/apps/frappe/frappe/init_production_db.py

docker compose -f infra/local-dev/docker-compose.yml exec backend \
  bench --site localhost execute frappe.init_production_db.run_from_bench

docker compose -f infra/local-dev/docker-compose.yml exec backend \
  bench --site localhost migrate
```

### 4. Configure the API bridge

```bash
cp apps/api/.env.example apps/api/.env
```

Populate `apps/api/.env`:

```env
FRAPPE_URL=http://localhost:8080
FRAPPE_API_KEY=<generated in Frappe UI>
FRAPPE_API_SECRET=<generated in Frappe UI>
PORT=3000
NODE_ENV=development
```

API keys are generated in Frappe under: top-right menu > My Profile > API Access > Generate Keys.

### 5. Install dependencies and start

```bash
npm install
npm run dev
```

This starts `apps/api` on port 3000 and `apps/web` on port 3001 concurrently.

---

## API Reference

See [docs/API.md](docs/API.md) for endpoint documentation.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design and architectural decisions.
