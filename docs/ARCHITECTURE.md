# Echoes of Eternity • Architecture Overview

## System Context

```
System Context
--------------

+-------------------------------------+
| Visitor Device (Mobile Browser +    |
| Camera)                             |
--------------------------------------+
                |
                | HTTPS
                v
+------------------------------------+
| React SPA (Vite, TypeScript)       |
-------------------------------------+
                |
                | REST / WebSocket
                v
+------------------------------------+
| FastAPI Service (Uvicorn +          |
| Socket.IO)                          |
-------------------------------------+
        | ORM                | Assets
        v                    v
+----------------+    +------------------------------+
| SQLite (SQLAlchemy) | Asset Store (Videos, Markers, |
|                     | Images)                       |
+----------------+    +------------------------------+
        \
         \ Optional
          v
+----------------------------------------------+
| CAMARA / MaaS APIs (GSMA Open Gateway)       |
+----------------------------------------------+
```

- **Visitor Device**: Runs the AR-capable React SPA, accesses through HTTPS for camera/geolocation permissions.
- **Frontend**: TypeScript React app served via Vite; handles routing, AR rendering (A-Frame + AR.js), persona chat UI, and itinerary planning.
- **Backend**: FastAPI application exposing REST routes (health, attractions CRUD, analytics prompts) and Socket.IO namespace `/analytics-socket`.
- **Database**: SQLite database seeded from YAML (`backend/store/data/attractions.yaml`) via SQLAlchemy models.
- **Asset Store**: Static mount points for AR markers, NFT packs, videos, and images.
- **CAMARA / MaaS APIs**: Future/optional live integrations replacing current mock responses for network-aware analytics.

## Frontend Architecture (Vite + React)

```
Frontend Architecture
---------------------

[main.tsx]
     |
     v
[App.tsx (Routes + Suspense)]
     |
     v
[AppLayout (Navigation + Shell)]
     |
     +--> [Pages]
             |
             +--> [HomePage (Hero & CTAs)]
             +--> [AR Pages (Marker / Location / Image NFT)]
             +--> [PlanItineraries (Density + Itinerary UI)]
             +--> [AnalyticsChatPage]
             +--> [Dashboard / Admin / Help]

Supporting Modules
------------------
[AR Pages] ----> [Custom Hooks (useArScripts, useAttractions)]
[AR Pages] ----> [services/camaraApi.ts (QoD / Device mocks)]
[PlanItineraries] ----> [Zustand personaStore]
[PlanItineraries] ----> [api/client.ts (Axios)]
[AnalyticsChatPage] ----> [Socket.IO client]
[Pages] <---- [CSS Modules styling]
[AR Pages] <---- [public/scripts (A-Frame, AR.js)]
```

- **App Entry**: `main.tsx` hydrates `App.tsx`, which registers lazy-loaded pages via React Router.
- **AppLayout**: Provides header navigation, AR shell handling, and consistent main content area.
- **Pages**:
  - `HomePage`: Marketing hero + navigation CTAs.
  - `ar/*`: A-Frame powered experiences (marker, location, image NFT) loading AR.js scripts on demand.
  - `PlanItineraries`: Persona-aware itinerary planner with CAMARA density mock integration and hover/touch detail overlays.
  - `AnalyticsChatPage`: Realtime persona chat linking REST prompts and Socket.IO status updates.
  - `AdminPage`, `DashboardPage`, `HelpPage`, etc.: Supporting management and storytelling surfaces.
- **State & Hooks**:
  - `usePersonaStore` (Zustand) controls persona selection, tokens, and session IDs.
  - `useAttractions`, `useMetrics`, `useRecordVisit` handle attraction data, dashboard metrics synthesis, and visit logging.
- **Services & API**:
  - `api/client.ts` centralizes Axios configuration.
  - `api/analytics.ts`, `api/attractions.ts` wrap REST endpoints for chat prompts, itinerary planning, and admin CRUD.
  - `services/camaraApi.ts` mirrors CAMARA QoD/location workflows for front-end simulations.
- **AR Runtime**:
  - A-Frame + AR.js scripts shipped in `/public/scripts`, dynamically loaded through `useArScripts` to avoid double registration.
  - Marker/NFT assets served from backend static mounts.

## Backend Architecture (FastAPI)

```
Backend Architecture
--------------------

               +-------------------------+
               | FastAPI Application     |
               +-------------------------+
                     |          |          \
                     |          |           \ Static mounts
                     v          v            \
            +---------------+  +-----------------+
            | Routers       |  | Socket.IO App    |
            |---------------|  | (/analytics-socket) |
            | /health       |                       |
            | /api/attractions |                    |
            | /analytics-chat  |                    |
            | /time-weave      |                    |
            +---------------+                       |
                     |                               |
                     v                               |
            +-------------------------+              |
            | SQLAlchemy ORM Layer    |              |
            +-------------------------+              |
                     | ORM                               
                     v                               |
            +-------------------------+              |
            | SQLite Database         |              |
            +-------------------------+              |
                     ^                               |
                     | Seed (initial_data)           |
                     +-------------------------------+
                     |
                     v
        +-------------------------------+
        | Static Assets (/assets,       |
        | /images, /data)               |
        +-------------------------------+
```

- **Routers**:
  - `health`: Basic readiness endpoint.
  - `attractions`: CRUD endpoints backed by SQLAlchemy models (`backend/app/models.py`) with Pydantic schemas.
  - `analytics`: Accepts prompts, orchestrates persona responses (currently mock, ready for CAMARA MaaS integration).
  - `time_weave`: Streaming status updates linked to the analytics chat.
- **Socket.IO**:
  - Mounted under `/analytics-socket`, shares session IDs from the React chat client.
- **Database & Seeding**:
  - SQLite file `backend/app.db`; tables created on startup.
  - If empty, seeded from YAML (`backend/store/data/attractions.yaml`) via `initial_data.py`.
- **Services**:
  - `services/analytics.py`: Response synthesis for personas / chat.
  - `services/camara/`: Contains mock MaaS client scaffolding ready for production tokens.
  - `services/persona.py`: Persona definitions and traits.
- **Static Assets**:
  - `/assets`: Videos, marker patterns, NFT bundles under `backend/store/assets`.
  - `/images`: Attraction imagery.
  - `/data`, `/api/data`: Raw YAML exports for version control.

## Development & Deployment

- **Local Dev**: `npm run dev` (Vite SPA) + `uvicorn backend.app.main:app --reload`. Optional HTTPS via `frontend/generate-self-signed.sh`.
- **Docker Compose**: `docker compose up --build` spins up backend + HTTPS frontend with shared volume hot reload (`docker-compose.dev.yml`).
- **Start Script**: `./start-server.sh` builds frontend, runs backend with TLS for camera testing.

## Key Data Flows

1. **Attraction Management**
   - Admin Page fetches attractions via `/api/attractions`.
   - Changes persisted to SQLite; optional export to YAML for Git history.

2. **AR Experience**
   - Frontend loads attraction definitions, initializes AR scene.
   - On detection, video + narrative overlays stream from `/assets`.
   - Location AR cross-checks device GPS (mocked) and can request QoD (mocked CAMARA APIs).

3. **Plan Itineraries**
   - React page calls CAMARA Population Density mock (`services/camaraApi.ts` + backend placeholder) to display density badges.
   - Hover/touch surfaces historical density insights from deterministic mocks.
   - State stored in component + persona store for per-user personalization.

4. **Analytics Chat**
   - User submits prompt → `POST /analytics-chat`.
   - Backend orchestrates persona response, optionally streaming events via `/analytics-socket`.
   - Frontend renders timeline with attachments, status log updates, and persona metadata.

## Future Enhancements

- Replace CAMARA mocks with live Open Gateway integrations (Device Location, MaaS) by configuring secrets.
- Expand database to Postgres for scalability, introducing migrations via Alembic.
- Tighten auth around admin endpoints with persona JWTs or operator SSO.
- Containerize AR assets behind CDN with signed URLs for production load.

