# Copilot Instructions - AutoCRM Backend

## Project Overview

This is a production-ready Node.js TypeScript backend using Express.js with a modular architecture.

## Code Organization

- **Controllers** (`src/controllers/`): HTTP request handlers
- **Services** (`src/services/`): Business logic and operations
- **Routes** (`src/routes/`): API endpoint definitions
- **Middleware** (`src/middleware/`): Express middleware (error handling, logging, etc.)
- **Utils** (`src/utils/`): Utility functions (logger, helpers)
- **Types** (`src/types/`): TypeScript type definitions and interfaces
- **Frappe** (`src/frappe/`): Frappe ERP integration code

## Development Guidelines

### Code Style

- Use strict TypeScript (`strict: true` in tsconfig.json)
- All functions should have explicit return types
- Use path aliases for imports (e.g., `@services/`, `@utils/`)
- Avoid `any` type unless absolutely necessary
- Use proper error handling with custom error types

### Naming Conventions

- Files: `camelCase.ts` (e.g., `userService.ts`, `errorHandler.ts`)
- Classes: `PascalCase` (e.g., `UserService`)
- Functions: `camelCase` (e.g., `getUserById()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`)
- Types/Interfaces: `PascalCase` (e.g., `UserResponse`)

### Module Organization

Each feature should follow this pattern:

```
src/
└── feature/
    ├── featureController.ts
    ├── featureService.ts
    └── featureRoutes.ts
```

### Environment Variables

- Store all configuration in `.env` file
- Never hardcode secrets or configuration
- Use `process.env.*` with type safety

### Error Handling

- Use the centralized error handler middleware
- Log errors with context using the logger
- Return consistent API responses

### Logging

Use the logger from `@utils/logger`:

- `logger.debug()` - Detailed debugging information
- `logger.info()` - General informational messages
- `logger.warn()` - Warning messages
- `logger.error()` - Error messages

## TypeScript Path Aliases

Use these aliases for imports:

- `@controllers/*` - Controllers directory
- `@services/*` - Services directory
- `@routes/*` - Routes directory
- `@utils/*` - Utils directory
- `@types/*` - Types directory
- `@frappe/*` - Frappe integration
- `@middleware/*` - Middleware directory
- `@/*` - Any file in src

## Running the Project

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Common Tasks

### Adding a New API Endpoint

1. Create controller in `src/controllers/featureController.ts`
2. Create service in `src/services/featureService.ts`
3. Add routes in `src/routes/featureRoutes.ts`
4. Import and use routes in `src/index.ts`

### Adding Frappe Integration

1. Create integration module in `src/frappe/frappeClient.ts`
2. Add authentication and API methods
3. Use in services when needed

### Adding Middleware

1. Create middleware in `src/middleware/`
2. Import in `src/index.ts`
3. Apply to routes or globally as needed

## API Response Format

All API responses should follow this format:

```typescript
{
  "success": boolean,
  "message": string,
  "data": <T>,
  "timestamp": "ISO-8601 string",
  "error": "<error message if failed>"
}
```

## Testing

Currently, no test framework is configured. To add tests:

1. Install Jest: `npm install --save-dev jest @types/jest ts-jest`
2. Create `jest.config.js`
3. Create tests in `__tests__/` or `.test.ts/.spec.ts` files

## Deployment

1. Build: `npm run build`
2. Set environment variables on server
3. Run: `npm start`

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://nodejs.org/en/docs/)
