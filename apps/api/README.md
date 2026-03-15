# AutoCRM Backend

A production-ready Node.js TypeScript backend for AutoCRM with Express.js, strict type safety, and modular architecture.

## Features

- **TypeScript**: Strict type checking with comprehensive configuration
- **Express.js**: Lightweight and flexible web framework
- **Environment Variables**: Managed with dotenv for multiple environments
- **CORS**: Cross-origin request handling
- **Logging**: Built-in logger with color-coded output
- **Error Handling**: Centralized error handling middleware
- **Modular Architecture**: Well-organized directory structure for scalability
- **Cross-Platform**: Compatible with Linux, macOS, and Windows

## Project Structure

```
src/
├── index.ts                 # Application entry point
├── controllers/             # HTTP request handlers
├── services/               # Business logic and data operations
├── routes/                 # API route definitions
├── middleware/             # Express middleware (error handling, etc.)
├── utils/                  # Utility functions and helpers
├── types/                  # TypeScript type definitions
└── frappe/                 # Frappe integration code
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Configure required Frappe credentials in `.env`:

```env
# Required - Update with your Frappe instance details
FRAPPE_URL=http://localhost:8000
FRAPPE_API_KEY=your_api_key_here
FRAPPE_API_SECRET=your_api_secret_here
PORT=3000
```

**Note**: The application validates all required environment variables on startup. If any are missing or invalid, the application will exit with a descriptive error message.

For detailed environment variable documentation, see [ENV_CONFIG.md](./src/config/ENV_CONFIG.md)

## Available Scripts

```bash
# Development with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Clean build directory
npm run clean
```

## Development Workflow

1. **Write TypeScript code** in `src/` directory
2. **Use path aliases** defined in `tsconfig.json` for imports:
   - `@controllers/` - for controllers
   - `@services/` - for services
   - `@routes/` - for routes
   - `@utils/` - for utilities
   - `@types/` - for type definitions
   - `@frappe/` - for Frappe integrations
   - `@middleware/` - for middleware

3. **Run development server**:

   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

The following **required** environment variables must be configured before starting the application:

| Variable            | Type   | Required | Description                          |
| ------------------- | ------ | -------- | ------------------------------------ |
| `FRAPPE_URL`        | URL    | Yes      | Base URL of your Frappe instance     |
| `FRAPPE_API_KEY`    | string | Yes      | API key for Frappe authentication    |
| `FRAPPE_API_SECRET` | string | Yes      | API secret for Frappe authentication |
| `PORT`              | number | Yes      | Server port (1-65535)                |

Optional variables with defaults:

| Variable      | Default       | Description                               |
| ------------- | ------------- | ----------------------------------------- |
| `NODE_ENV`    | `development` | Environment mode (development/production) |
| `HOST`        | `localhost`   | Server host/IP address                    |
| `LOG_LEVEL`   | `info`        | Logging level (debug/info/warn/error)     |
| `CORS_ORIGIN` | `*`           | CORS allowed origin                       |

All environment variables are validated on application startup. If any required variable is missing or invalid, the application will exit with a descriptive error message.

See [ENV_CONFIG.md](./src/config/ENV_CONFIG.md) for detailed environment variable configuration and validation rules.

## API Endpoints

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

## Architecture

### Controllers

- Handle HTTP requests/responses
- Input validation
- Call appropriate services

### Services

- Business logic implementation
- Database operations
- Data transformation

### Frappe Integration

- API communication with Frappe
- Authentication handling
- Data synchronization

### Middleware

- Error handling
- Request logging
- Custom middleware logic

### Utilities

- Helper functions
- Logger
- Common operations

### Types

- TypeScript interfaces
- Type definitions
- Request/Response types

## Error Handling

The application includes a centralized error handler middleware that:

- Catches all unhandled errors
- Logs errors with context
- Returns consistent error responses
- Hides sensitive information in production

## Logging

The built-in logger provides:

- Color-coded output
- Configurable log levels
- Timestamps for all logs
- Metadata support for context

Example usage:

```typescript
import { logger } from "@utils/logger";

logger.debug("Debug message", { userId: 123 });
logger.info("User logged in");
logger.warn("Deprecated API used");
logger.error("Failed to process request", error);
```

## Production Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Set environment variables on your server

3. Start the server:
   ```bash
   npm start
   ```

## Next Steps

1. Define API routes in `src/routes/`
2. Create controllers in `src/controllers/`
3. Implement business logic in `src/services/`
4. Set up Frappe integration in `src/frappe/`
5. Add additional middleware as needed
6. Configure environment variables for your deployment

## License

MIT
