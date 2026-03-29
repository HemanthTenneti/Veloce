# Veloce Storefront (@veloce/web)

The Next.js 15 frontend storefront for the Veloce premium automobile dealership platform. Features vehicle inventory browsing, advanced filtering, i18n support (English/Spanish), and customer enquiry management.

## Technology Stack

- **Next.js 15** (App Router with dynamic `[locale]` segment)
- **GSAP** for smooth animations and motion
- **Lenis** for scroll physics
- **Tailwind CSS 4** for styling
- **next-intl v4.8.3** for internationalization
- **Zod** for client-side validation

## Getting Started

From the repository root, run:

```bash
npm run dev:web
```

The storefront will start on **http://localhost:3000** with hot-reloading enabled.

## Project Structure

```
src/
├── app/
│   ├── [locale]/            # Dynamic segment for i18n routing
│   ├── layout.tsx           # Root layout with i18n setup
│   └── middleware.ts        # Locale detection and routing
├── components/
│   ├── VehicleGrid.tsx      # Vehicle listing with filtering
│   ├── EnquiryModal.tsx     # Customer enquiry form
│   └── ...
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
└── styles/                  # Global styles
messages/
├── en.json                  # English UI strings
└── es.json                  # Spanish UI strings
```

## Localization

The storefront supports English and Spanish with the following routing:
- **English** (default): `/`, `/inventory`, etc.
- **Spanish**: `/es`, `/es/inventory`, etc.

All UI strings are externalized into message catalogs. Vehicle data (Make, Model, VIN, Year, Mileage) is never translated.

## Development Workflow

1. **Edit components** in `src/components/` — hot reload enabled
2. **Add translations** to `messages/en.json` and `messages/es.json`
3. **Test locally** at http://localhost:3000
4. **Use the bridge** at `http://localhost:5005/api/*` for API calls

For more details, see the [main README](../../README.md).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [GSAP Documentation](https://gsap.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
