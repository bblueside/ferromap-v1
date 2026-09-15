# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ferromap "Censo de ferreterías" — a Colombian hardware-store (ferretería) market-intelligence platform. A React/Vite SPA (`frontend/`, package name `ferromap-ui`) renders a Leaflet map, an agent control panel, and a dashboard over data produced by an external multi-agent pipeline. `backend/` is an Express + MongoDB service that serves auth and every dataset the UI reads. Only pipeline *runs* (launch agents, poll status, upload files) go to a separate service on `http://127.0.0.1:5000` that is not in this repo.

UI copy, comments, and domain vocabulary are Spanish (zonas, ferreterías, plantas, rutas, potencial). Keep new user-facing strings in Spanish.

## Commands

```bash
# frontend/
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build  ← the only type-check; run before claiming a change compiles
npm run lint     # eslint .

# backend/
npm run dev      # nodemon src/index.js
npm start        # node src/index.js
```

No test suite exists in either package. `backend/.env` supplies `PORT` (3000), `MONGODB_URI`, `SECRET_JWT_KEY`.

## Two backends, and which one matters

- **Express backend (`backend/`, port 3000)** — auth (`/api/users/{register,login,logout,me}`) plus read-only data routers, one controller per Mongoose model (`getAllX` → `Model.find()`), each router guarded by `requireAuth`:
  - `/api/map` — `getAllPos`, `getAllTopZones`, `getAllFactories`, `getAllWarehouse`, `getAllRoutes`
  - `/api/dashboard` — `getAllKpis`, `getAllPosCoverage`, `getAllPosCoverageGap`
  - `/api/control` — `getAllAgentsLog`, `getAllAgentRecords`

  Login sets an httpOnly `access_token` JWT cookie; `jwt.middleware.js` runs globally and populates `req.session.user` (or `null`), and `requireAuth` turns `null` into a 401. Collections are seeded from `src/csv/` by the `npm run import:*` scripts, except `routes`, which `import:routes` loads (delete + reinsert) from GeoJSON files. Those source files are no longer in the repo, so `ROUTES_DIR` in `backend/src/scripts/import-routes.js` points to a missing folder; the `routes` collection already in MongoDB is the only copy.
- **Pipeline API (port 5000, external)** — only pipeline writes/polling, via `services/pipelineService.ts`.

## Frontend architecture

`routes/routes.tsx` defines `/login` plus three authenticated routes under `AppLayout` (`components/layout/AppLayout.tsx`: Header + `<Outlet />`), guarded by `RequireAuth` / `PublicOnly` (`routes/guards.tsx`) via `useAuth()` (`services/auth/useAuth.ts`, provided by `AuthProvider.tsx`).

Each shared context follows the same split so React Fast Refresh keeps working: context + hook in a `.ts` file (`useAuth.ts`, `usePos.ts`, `useDashboard.ts`, `lib/useSelection.ts`, `lib/useFilterState.ts`) and the provider component alone in a `.tsx` file (`AuthProvider`, `PosScope`, `DashboardScope`, `SelectionProvider`, `FilterProvider`). Route table:

| Route | Root component | Directory |
|---|---|---|
| `mapa-interactivo` | `MapDashboard` | `components/Mapa_Interactivo/` |
| `control-operativo` | `AgentManager` | `components/ControlOperativo/` |
| `dashboard` | `Dashboard` | `components/Dashboard/` |

### Data flow

All remote reads use `services/http.ts`: `fetchJson` (uniform errors; any 401 triggers the global logout handler) and `useApiResource(fetcher)` → `FetchState<T>` (`data / loading / error / refetch`; the fetcher must be module-level/stable). Endpoints return flat arrays, and each tab owns its data, fetched once per tab mount:

| Tab | Service | Shared via |
|---|---|---|
| Mapa | `services/pos/posService.ts` (`/api/map/*`) | `PosScope` / `usePos()` (mounted in `AppProviders`) |
| Dashboard | `services/dashboard/dashboardService.ts` (`/api/dashboard/*` + agent records + map pos/zones), adapted to chart shapes in `fetchDashboardData` | `DashboardScope` / `useDashboard()` (mounted in `Dashboard`) |
| Control Operativo | `services/control/controlService.ts` (`/api/control/*`) | `useControlData` (called in `AgentManager`) → `logs` to `ExecutionHistory`, `recordsByAgent` to `AgentGrid` |

Children must consume the tab's hook/props rather than fetching themselves. Typed contracts live in the service that fetches them (`posService.ts` → `Pos`, `zone`, `Factory`, `Warehouse`, `RouteDoc`; `dashboardService.ts` → KPI/coverage entries); types used by only one tab live in that tab's folder. Vite proxies `/api/{users,map,dashboard,control}` to :3000; each service's base URL can be overridden with a `VITE_*_API_URL` (see `.env.example`).

Pipeline writes (runs, status polling, uploads) live in `services/pipelineService.ts`, base `VITE_PIPELINE_API_URL` (default `http://127.0.0.1:5000`).

`services/agentAdapter.ts` maps UI agent display names → pipeline agent codes (`A1`–`A6`, `A2R`). Adding an agent means one entry in `AGENTS` (`components/ControlOperativo/agents/agentCatalog.tsx`, with `layoutGroup` and `variant`; the `Agent` type is in `domain/agent.ts`) plus the name→code table.

### Control Operativo layout

`components/ControlOperativo/` is split by responsibility; `AgentManager` only composes:

- `domain/` — pure functions, no React (roster updates, pipeline status mapping + polling, history rows/date ranges, upload queue, preview filters).
- `hooks/` — state: `useAgentRoster` (single agent list), `usePipelineRunner` (runs + polling via an `ExecutionPlan`, aborts on unmount), `useControlData`, `useExecutionHistoryTable`, `useUploadQueue`, `useNormalizationPreview`, `useDisclosure`.
- `agents/` — `AgentCard` switches on `agent.variant` (`StandardAgentCard` | `InputDataAgentCard`), both built on `AgentCardLayout`.
- `modals/` — `ModalShell` + `modalPrimitives` shared by every modal; `upload/` and `preview/` subfolders.
- `history/`, `header/`. Modals are built on `components/shared/modal/` (`ModalShell`, `modalPrimitives`), shared with the Dashboard `ReportModal`.

### Map layer

`MapDashboard` wraps the map in `AppProviders` (`SelectionProvider` + `FilterProvider`) — those contexts exist **only inside the map tab**, so `useFilters()`/`useSelection()` throw elsewhere.

`lib/useFilterState.ts` is the single source of truth for every filter (priority, tamaño, tipo, estado, fuentes/agents, zonas, plus map-layer toggles for plantas/centros/rutas) and exposes `getFilteredFerreterias()`. Its `ALL_*` constants are canonical values that must match the JSON (`source_agents` = `"A1" | "A2" | "A3"`; priorities and estado come from `PRIORITIES` / `MAP_POS_STATUSES` in `@/constants`). Note `HeatCircleMarkers` re-implements the filtering inline instead of calling `getFilteredFerreterias`, so filter-semantics changes need updating in both places.

`HeatCircleMarkers` is the most intricate component: it runs an in-file DBSCAN clustering over ferretería coordinates, draws raw Leaflet `CircleMarker`s imperatively (not via react-leaflet children), and renders popups by `createPortal`-ing React components into DOM containers bound to Leaflet popups. Circle color/radius/opacity come from `utils/heatCircleUtils.ts`, keyed by `Priority` (`PRIORITY_META.hex` in `@/constants`) and a 1–3 zoom level.

`LayerGeoJson` draws plantas/centros from `usePos()` (`factories` / `warehouses`, flat docs with `latitud`/`longitud`) and routes from `usePos().routes` (`GET /api/map/getAllRoutes`, one doc per city with `id`, `label`, `cities` and a GeoJSON `FeatureCollection`). Plant/warehouse marker icons are in `map/facilityIcons.ts`. Route ids aren't known to `useFilterState` (`FilterProvider` sits outside `PosScope`), so `toggleAllRutas(ids)` takes them from the caller.

### Local JSON data

`services/control/normalizationPreviewService.ts` still serves `services/control/fixtures/normalized_data.json` as mock preview data for the Input Data Agent — that module is the seam to replace with the real upload/preview/commit endpoints, not the pattern to follow.

### Global constants and styles

Colors and states live in `src/constants/index.ts`; reusable styles live in `src/App.css` (imported from `index.css`). Components must not declare hex values, status→color maps, or badge/button/table/modal class strings of their own.

- **`@/constants`** — data only: `FERROMAP_PALETTE`, `BRAND_COLORS`, `MAP_COLORS`, `CHART_SERIES_COLORS` (hex for Leaflet/Recharts/inline HTML; brand/map colors are mirrored as `@theme static` tokens in `index.css`, change both together) and state catalogs (`POS_STATUS_META`, `CATEGORIAS`, `PRIORITY_META`, `QUALITY_TONE`, `AGENT_STATUS_TONE`, `EXECUTION_STATUS_META`, `PIPELINE_STATUS`, `UPLOAD_ITEM_STATUS_META`, `MATCH_STATUS_META`, `COMPLETENESS_META`). Catalogs store a `Tone`, never classes; resolve API values with `metaFor(catalog, value, fallback)` and scores with `scoreTone(value, "coverage" | "confidence")`.
- **`App.css`** — `ui-*` classes built with `@apply`, in two cascade layers:
  - `components` (before `utilities`): styles for our own elements (`ui-page-title`, `ui-modal-*`, `ui-choice-*`, `ui-dropzone`, `ui-nav-link`…). A utility in `className` can adjust them.
  - `semantic` (after `utilities`): tones `ui-tone-{tone}-{slot}` (build them with `toneClass(tone, slot)`) and classes applied to shadcn primitives (`ui-btn-brand`, `ui-table-*`, `ui-pager`), which must beat the primitives' own color utilities. They can't be overridden with utilities — add a modifier class in the same layer instead (e.g. `ui-table-empty-lg`).
- UI state is expressed through attributes styled in CSS (`aria-pressed`, `aria-current="page"`, `data-dragging`), not conditional class names.

### UI conventions

shadcn/ui (style `radix-nova`, base color neutral, lucide icons) in `components/ui/`; add components via the shadcn CLI so `components.json` aliases stay correct. Tailwind v4 with CSS-variable theming; `@/` resolves to `frontend/src` (aliased in both `vite.config.ts` and `tsconfig.app.json`). `tsconfig.app.json` sets `noUnusedLocals`/`noUnusedParameters`, so dead imports fail `npm run build`.

## Agent skill rules

`.agents/skills/` and `.claude/skills/` carry Vercel's React performance rulebooks (`vercel-react-best-practices`, `vercel-react-view-transitions`) and `writing-guidelines`. Consult `vercel-react-best-practices/SKILL.md` before non-trivial React refactors — the map components in particular are performance-sensitive (per-marker Leaflet layers, O(n²) DBSCAN neighbor scans).
