# Project structure (production-oriented)

This document describes the folder structure and conventions used in COURT Kutchery.

## Root layout

```
court-kutchery/
├── app/                    # Expo Router – routes & screen components only
├── components/             # Reusable UI
│   ├── layout/            # Navbar, Sidebar (app shell)
│   ├── ui/                # Primitives (IconSymbol, Collapsible, etc.)
│   └── errors/            # ErrorBoundary
├── config/                # App config (env, feature flags)
├── constants/             # Theme, routes, shared constants
├── contexts/              # React context (Auth)
├── hooks/                 # Custom hooks
├── services/              # API / business logic (auth, api client)
├── types/                 # Shared TypeScript types
├── utils/                 # Pure helpers (formatters, validators)
├── assets/                # Images, fonts
└── docs/                  # Project docs (e.g. STRUCTURE.md)
```

## Conventions

- **Routes**: Use `constants/routes.ts` (`ROUTES`) for navigation paths instead of string literals.
- **Imports**: Prefer barrel imports where available (`@/components`, `@/contexts`, `@/constants`).
- **Auth**: Auth state lives in `contexts/AuthContext`; auth logic (login/signUp) in `services/auth.service.ts`. Swap the service for a real API when ready.
- **Types**: Shared types in `types/`; re-export from `types/index.ts`.
- **Screens**: Keep `app/` thin – layout and data in components/hooks/services.

## Key files

| Path | Purpose |
|------|--------|
| `app/_layout.tsx` | Root layout: ErrorBoundary → AuthProvider → Theme → Stack |
| `app/index.tsx` | Redirect by auth/splash state |
| `constants/routes.ts` | `ROUTES` for type-safe navigation |
| `constants/theme.ts` | `AppColors`, `Colors`, `Fonts` |
| `contexts/AuthContext.tsx` | Auth state + `useAuth()` |
| `services/auth.service.ts` | Dummy login/signUp; replace with API |
| `components/layout/` | Navbar, Sidebar |
| `components/errors/ErrorBoundary.tsx` | Global error UI |
