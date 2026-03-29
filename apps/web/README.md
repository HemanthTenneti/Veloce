# Veloce Web (@veloce/web)

The Next.js 15 storefront for the Veloce premium automobile dealership platform.

## Quick Start

From the repository root:

```bash
npm run dev
```

Or from this directory:

```bash
npm run dev
```

The storefront runs on **http://localhost:3000**.

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── inventory/           # Inventory page
├── components/
│   ├── landing/             # Home page sections
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedVehicles.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── InventoryCTA.tsx
│   │   └── ReserveCTA.tsx
│   ├── inventory/           # Inventory components
│   │   ├── VehicleGrid.tsx
│   │   ├── FilterBar.tsx
│   │   ├── InventoryHeader.tsx
│   │   └── EnquiryModal.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ThemeProvider.tsx
│   ├── SmoothScrollProvider.tsx
│   ├── LoadingScreen.tsx
│   └── ScrollToTop.tsx
├── hooks/
│   ├── useVehicles.ts       # Vehicle data fetching hook
│   └── useGsapAnimations.ts # GSAP animation utilities
├── i18n/
│   ├── navigation.ts        # i18n navigation helpers
│   ├── request.ts           # Server-side i18n config
│   └── routing.ts           # Locale routing config
├── lib/
│   ├── hardcodedVehicles.ts # Vehicle data source
│   ├── vehicleApi.ts        # Vehicle data utilities
│   └── lenisStore.ts        # Smooth scroll state
└── types/
    └── vehicle.ts           # TypeScript interfaces
messages/
├── en.json                  # English translations
└── es.json                  # Spanish translations
public/
└── media/                   # Vehicle images
```

## Scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `npm run dev`      | Start dev server (port 3000) |
| `npm run build`    | Production build             |
| `npm run start`    | Start production server      |
| `npm run lint`     | Run ESLint                   |
| `npm run typecheck`| TypeScript type checking     |

## Key Features

### Internationalization
- English (default): `/`, `/inventory`
- Spanish: `/es`, `/es/inventory`

Translations are in `messages/en.json` and `messages/es.json`.

### Animation System
- **GSAP**: Page transitions and scroll-triggered animations
- **Lenis**: Smooth scroll physics

### Vehicle Data
Managed in `src/lib/hardcodedVehicles.ts`. Each vehicle includes:
- Basic info (make, model, year, color)
- Pricing (market price, carstreet price)
- Specifications (mileage, transmission, fuel type)
- Image gallery (up to 10 images)

## Adding New Vehicles

1. Add images to `public/media/{VehicleName}/`
2. Update `src/lib/hardcodedVehicles.ts` with vehicle data
3. Images paths should be `/media/{VehicleName}/{image}.jpeg`

## Configuration Files

| File                 | Purpose                        |
| -------------------- | ------------------------------ |
| `next.config.ts`     | Next.js configuration          |
| `tsconfig.json`      | TypeScript configuration       |
| `eslint.config.mjs`  | ESLint rules                   |
| `postcss.config.mjs` | PostCSS/Tailwind configuration |
