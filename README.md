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
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   ├── landing/         # Home page sections
│   │   └── inventory/       # Inventory page components
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # Internationalization config
│   ├── lib/                 # Utilities and data
│   └── types/               # TypeScript interfaces
├── messages/                # i18n translation files
├── public/                  # Static assets and media
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.mjs        # ESLint configuration
└── postcss.config.mjs       # PostCSS/Tailwind configuration
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The storefront will be available at **http://localhost:3000**.

### Production Build

```bash
npm run build
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

All UI strings are externalized into `messages/en.json` and `messages/es.json`.

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

## Vehicle Data

Vehicle data is managed in `src/lib/hardcodedVehicles.ts`. Images are served from `public/media/` with the following structure:

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
