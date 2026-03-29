# Veloce Storefront

A premium automobile dealership storefront built with Next.js 15. Features a curated vehicle inventory browser with advanced filtering, smooth animations, and bilingual support (English/Spanish).

## Technology Stack

| Layer         | Technology                                       |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 15 (App Router)                          |
| Styling       | Tailwind CSS 4                                   |
| Animation     | GSAP, Lenis (smooth scroll)                      |
| i18n          | next-intl v4.8.3                                 |
| Language      | TypeScript 5                                     |

---

## Project Structure

```
/
├── apps/
│   └── web/                 # Next.js storefront (@veloce/web)
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── i18n/        # Internationalization config
│       │   ├── lib/         # Utilities and data
│       │   └── types/       # TypeScript interfaces
│       ├── messages/        # i18n translation files
│       └── public/          # Static assets and media
└── package.json             # Root workspace config
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Automobile-CRM

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The storefront will be available at **http://localhost:3000**.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

---

## Features

### Vehicle Inventory
- Curated collection of premium automobiles
- High-quality image galleries for each vehicle
- Detailed specifications including mileage, transmission, and pricing
- Filter by make, model, and availability status

### Internationalization
The storefront supports English and Spanish with `localePrefix: "as-needed"` routing:

| Locale | Path Prefix | Example                |
| ------ | ----------- | ---------------------- |
| `en`   | none        | `/`, `/inventory`      |
| `es`   | `/es`       | `/es`, `/es/inventory` |

All UI strings are externalized into `apps/web/messages/en.json` and `apps/web/messages/es.json`.

### Animations
- GSAP-powered scroll animations and transitions
- Lenis smooth scrolling for a premium feel
- Loading screen with animated transitions

---

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start development server (port 3000) |
| `npm run build`   | Create production build              |
| `npm run start`   | Start production server              |
| `npm run lint`    | Run ESLint                           |
| `npm run typecheck` | Run TypeScript type checking       |

---

## Docker Production Notes

The Next.js storefront is configured with `output: "standalone"` in `apps/web/next.config.ts`. This produces a self-contained build artifact for minimal Docker images.

### Standalone Build

```bash
# Build the storefront
npm run build

# Copy static assets into standalone tree
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
cp -r apps/web/public apps/web/.next/standalone/apps/web/public

# Run the standalone server
node apps/web/.next/standalone/apps/web/server.js
```

---

## Vehicle Data

Vehicle data is managed locally in `apps/web/src/lib/hardcodedVehicles.ts`. Images are served from `apps/web/public/media/` with the following structure:

```
public/media/
├── Bentley/
│   ├── BentleyFrontSide.jpeg
│   ├── BentleyFront.jpeg
│   └── ...
├── Lamborghini/
├── Porsche/
└── ...
```

To add or modify vehicles, update the `HARDCODED_VEHICLES` array in `hardcodedVehicles.ts`.

---

## License

Private - All rights reserved.
