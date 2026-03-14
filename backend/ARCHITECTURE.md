# Backend Architecture

## Project Structure

```
backend/
├── src/
│   ├── server.ts                          # Application entry point
│   │
│   ├── config/
│   │   ├── appConfig.ts                   # Configuration management
│   │   └── index.ts                       # Config exports
│   │
│   ├── controllers/
│   │   ├── index.ts                       # Controllers barrel export
│   │   ├── vehicle/
│   │   │   ├── createVehicle.ts           # Create vehicle controller
│   │   │   ├── getVehicle.ts              # Get single vehicle controller
│   │   │   ├── getVehicles.ts             # Get all vehicles controller
│   │   │   ├── updateVehicle.ts           # Update vehicle controller
│   │   │   ├── deleteVehicle.ts           # Delete vehicle controller
│   │   │   └── index.ts                   # Vehicle controllers export
│   │   ├── lead/
│   │   │   ├── createLead.ts              # Create lead controller
│   │   │   ├── getLead.ts                 # Get single lead controller
│   │   │   ├── getLeads.ts                # Get all leads controller
│   │   │   ├── updateLead.ts              # Update lead controller
│   │   │   ├── deleteLead.ts              # Delete lead controller
│   │   │   └── index.ts                   # Lead controllers export
│   │   └── payment/
│   │       ├── createPayment.ts           # Create payment controller
│   │       ├── getPayment.ts              # Get single payment controller
│   │       ├── getPayments.ts             # Get all payments controller
│   │       ├── updatePayment.ts           # Update payment controller
│   │       ├── deletePayment.ts           # Delete payment controller
│   │       └── index.ts                   # Payment controllers export
│   │
│   ├── services/
│   │   ├── index.ts                       # Services barrel export
│   │   ├── vehicle/
│   │   │   ├── createVehicle.ts           # Create vehicle service
│   │   │   ├── getVehicle.ts              # Get single vehicle service
│   │   │   ├── getVehicles.ts             # Get all vehicles service
│   │   │   ├── updateVehicle.ts           # Update vehicle service
│   │   │   ├── deleteVehicle.ts           # Delete vehicle service
│   │   │   └── index.ts                   # Vehicle services export
│   │   ├── lead/
│   │   │   ├── createLead.ts              # Create lead service
│   │   │   ├── getLead.ts                 # Get single lead service
│   │   │   ├── getLeads.ts                # Get all leads service
│   │   │   ├── updateLead.ts              # Update lead service
│   │   │   ├── deleteLead.ts              # Delete lead service
│   │   │   └── index.ts                   # Lead services export
│   │   └── payment/
│   │       ├── createPayment.ts           # Create payment service
│   │       ├── getPayment.ts              # Get single payment service
│   │       ├── getPayments.ts             # Get all payments service
│   │       ├── updatePayment.ts           # Update payment service
│   │       ├── deletePayment.ts           # Delete payment service
│   │       └── index.ts                   # Payment services export
│   │
│   ├── routes/
│   │   ├── index.ts                       # Main route aggregator
│   │   ├── vehicleRoutes.ts               # Vehicle entity routes
│   │   ├── leadRoutes.ts                  # Lead entity routes
│   │   └── paymentRoutes.ts               # Payment entity routes
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts                # Global error handling
│   │   └── index.ts                       # Middleware exports
│   │
│   ├── utils/
│   │   ├── logger.ts                      # Logger utility
│   │   └── index.ts                       # Utils exports
│   │
│   ├── types/
│   │   ├── index.ts                       # Main type definitions
│   │   ├── vehicle.ts                     # Vehicle type definitions
│   │   ├── lead.ts                        # Lead type definitions
│   │   └── payment.ts                     # Payment type definitions
│   │
│   └── frappe/
│       ├── .gitkeep                       # Frappe integration files
│       └── index.ts                       # Frappe exports
│
├── package.json                           # Dependencies and scripts
├── tsconfig.json                          # TypeScript configuration
├── .eslintrc.json                         # ESLint configuration
├── .env.example                           # Environment variables template
├── .env                                   # Local environment variables
├── .gitignore                             # Git ignore rules
├── README.md                              # Project documentation
├── ARCHITECTURE.md                        # This file
└── .github/
    └── copilot-instructions.md            # Development guidelines
```

## Architecture Patterns

### Controller Layer

- **Purpose**: Handle HTTP requests and responses
- **Pattern**: Each CRUD operation in its own file
- **Location**: `src/controllers/[entity]/[operation].ts`
- **Responsibility**:
  - Request validation
  - Call appropriate service
  - Format and return responses

### Service Layer

- **Purpose**: Business logic implementation
- **Pattern**: Each CRUD operation in its own file
- **Location**: `src/services/[entity]/[operation].ts`
- **Responsibility**:
  - Business logic
  - Database operations (when implemented)
  - Data transformation
  - Error handling

### Route Layer

- **Purpose**: Define API endpoints
- **Pattern**: Entity-based route files
- **Location**: `src/routes/[entity]Routes.ts`
- **Responsibility**:
  - Define HTTP methods
  - Map endpoints to controllers
  - Add route-specific middleware

### Type Definitions

- **Purpose**: TypeScript type safety
- **Pattern**: Entity-based type files
- **Location**: `src/types/[entity].ts`
- **Includes**:
  - Entity interfaces
  - Request/Response DTOs
  - Custom types

### Configuration

- **Purpose**: Centralized configuration management
- **Location**: `src/config/appConfig.ts`
- **Provides**: Database, API, and app settings

### Frappe Integration

- **Purpose**: Frappe ERP API integration
- **Location**: `src/frappe/`
- **Ready for**: Client setup, authentication, API methods

### Middleware

- **Purpose**: Cross-cutting concerns
- **Current**: Error handling and logging
- **Extensible**: For authentication, validation, etc.

### Utilities

- **Purpose**: Reusable helper functions
- **Current**: Logger utility
- **Location**: `src/utils/`

## API Endpoint Structure

```
/api
├── /vehicles              # Vehicle management
│   ├── POST /             # Create vehicle
│   ├── GET /              # List all vehicles
│   ├── GET /:id           # Get specific vehicle
│   ├── PUT /:id           # Update vehicle
│   └── DELETE /:id        # Delete vehicle
│
├── /leads                 # Lead management
│   ├── POST /             # Create lead
│   ├── GET /              # List all leads
│   ├── GET /:id           # Get specific lead
│   ├── PUT /:id           # Update lead
│   └── DELETE /:id        # Delete lead
│
└── /payments              # Payment management
    ├── POST /             # Create payment
    ├── GET /              # List all payments
    ├── GET /:id           # Get specific payment
    ├── PUT /:id           # Update payment
    └── DELETE /:id        # Delete payment
```

## Module Organization

### Entity CRUD Operations

Each entity (Vehicle, Lead, Payment) follows this pattern:

1. **Controller** `src/controllers/[entity]/`
   - `create[Entity].ts` - Handle POST requests
   - `get[Entity].ts` - Handle GET single resource
   - `get[Entities].ts` - Handle GET list
   - `update[Entity].ts` - Handle PUT requests
   - `delete[Entity].ts` - Handle DELETE requests

2. **Service** `src/services/[entity]/`
   - Same file structure as controller
   - Contains actual business logic
   - Called by controllers

3. **Routes** `src/routes/[entity]Routes.ts`
   - Combines controllers and HTTP methods
   - Single file per entity

4. **Types** `src/types/[entity].ts`
   - Entity interface definition
   - Request/Response DTOs

## Import Path Aliases

All modules use TypeScript path aliases for clean imports:

```typescript
import { appConfig } from "@config/index";
import { createVehicleController } from "@controllers/vehicle";
import { createVehicleService } from "@services/vehicle";
import { vehicleRoutes } from "@routes/vehicleRoutes";
import { Vehicle } from "@types/vehicle";
import { logger } from "@utils/logger";
import { errorHandler } from "@middleware/errorHandler";
import { frappeClient } from "@frappe/index";
```

## Code Patterns

### Controller Pattern

```typescript
import { Request, Response } from "express";
import { createVehicleService } from "@services/vehicle";

export const createVehicleController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Implementation here
};
```

### Service Pattern

```typescript
import { ServiceResponse } from "@types/index";

export const createVehicleService = async (): Promise<ServiceResponse> => {
  // Implementation here
  return {
    success: true,
    message: "Vehicle created",
  };
};
```

### Route Pattern

```typescript
import { Router } from "express";
import { createVehicleController } from "@controllers/vehicle";

const router = Router();
router.post("/", createVehicleController);
export default router;
```

## Type Safety

- **Strict TypeScript**: All `tsconfig.json` strict options enabled
- **No `any`**: Explicitly typed everywhere
- **Return Types**: All functions have explicit return types
- **Entity-Specific Types**: Separate type files per entity
- **DTOs**: Request/Response interfaces for each operation

## Next Steps for Implementation

1. **Implement Entity Services**: Add database queries and business logic
2. **Implement Controllers**: Connect services to HTTP layer
3. **Add Validation**: Request validation middleware
4. **Frappe Integration**: Set up Frappe client in `src/frappe/`
5. **Database Setup**: Configure database connection in config
6. **Testing**: Add unit and integration tests
7. **Authentication**: Add auth middleware if needed

## Development Guidelines

- Follow the single-responsibility principle
- Keep each file focused on one operation
- Use barrel exports (index.ts) for clean imports
- Maintain consistent naming conventions
- Index all entity-specific operations
- Export all public functions/types
- Keep layers separated and testable

---

## Frappe Integration

This backend is designed to integrate with a **Frappe ERP instance** via Docker. Frappe handles data persistence, while the backend provides a REST API layer.

### Architecture Overview

```
┌─────────────┐         REST API          ┌──────────────┐
│   Frontend  │◄──────────────────────────►│  AutoCRM     │
│ (React App) │                            │  Backend     │
└─────────────┘                            │ (Node.js)    │
                                           └──────┬───────┘
                                                  │
                                          HTTP Client (Axios)
                                                  │
                                           ┌──────▼───────┐
                                           │    Frappe    │
                                           │     ERP      │
                                           │  (Docker)    │
                                           └──────────────┘
```

### How It Works

1. **Frontend** sends REST requests to the backend API
2. **Backend Controller** validates the request
3. **Backend Service** transforms the request into Frappe API calls
4. **Frappe Client** (HTTP client) communicates with the Frappe instance
5. **Frappe** handles data persistence and business logic
6. **Response** flows back through the layers to the frontend

### Frappe DocTypes

The backend expects three **DocTypes** (database entities) in Frappe:

- **Vehicle Inventory** — Vehicle listings with status, pricing, images
- **Lead** — Customer inquiries linked to vehicles
- **Payment** — Payment records linked to leads and vehicles

See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for detailed setup steps.

### Environment Configuration

Required environment variables for Frappe integration:

```env
# Frappe Instance
FRAPPE_URL=http://localhost:8080
FRAPPE_API_KEY=your_api_key
FRAPPE_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=development
```

### Frappe Client Methods

The backend provides a reusable Frappe client (`src/frappe/frappeClient.ts`) with standard HTTP methods:

- `get(method, params)` — Retrieve data
- `post(method, data)` — Create data
- `put(method, data)` — Update data
- `delete(method, params)` — Delete data
- `health()` — Check Frappe connectivity

### Error Handling Flow

```
Request → Controller Validation → Service (Frappe Call) → Error Handler → Response
                                        ↓ (Frappe error)
                                    Log error
                                    Format response
                                    Return to client
```

Errors from Frappe are caught, logged, and returned as standardized `ServiceResponse` objects.

### Authentication

Currently, the backend uses **API key-based authentication** with Frappe:

- API Key and Secret stored in environment variables
- Sent in request headers to Frappe
- Consider adding **OAuth** or **JWT** for future production deployments

---

## Getting Started with Frappe

For detailed setup instructions including Docker installation, Frappe deployment, and DocType creation, see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md).
