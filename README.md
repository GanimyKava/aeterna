# 🌏 Echoes of Eternity AR

> **A mobile-first web AR experience that brings history to life** — Point your camera at iconic landmarks or venue posters to unlock immersive historical video content, powered by telco network capabilities.

Built for the **Telstra Hackathon** to demonstrate how operator network capabilities (Device Location and Quality-on-Demand) can elevate AR experiences beyond traditional GPS and best-effort mobile data.

---

## 🎯 Problem Statement

Tourism experiences often lack the depth and engagement needed to truly connect visitors with historical significance. Traditional audio guides and static signage fall short of creating memorable, interactive experiences. Meanwhile, mobile networks have untapped potential to provide enhanced location accuracy and guaranteed quality of service for rich media experiences.

**Echoes of Eternity AR** solves this by:
- **Transforming static landmarks into living history** — Posters and monuments become interactive portals to the past
- **Leveraging network intelligence** — Using operator-verified location and on-demand network quality for superior reliability
- **Creating zero-friction experiences** — No app downloads, works directly in mobile browsers with camera access

---

## ✨ Key Features

### 🎬 Multi-Modal AR Detection
- **Marker-Based AR**: Recognizes NFT markers (e.g., MCG, Uluru) and plays associated videos with precise image alignment
- **Location-Based AR**: Automatically triggers content when users arrive at configured destinations
- **Image NFT Tracking**: Advanced image recognition for flexible marker deployment

### 📱 Mobile-First Design
- **Portrait-Optimized**: Designed for natural mobile phone usage
- **Responsive UI**: Seamless experience across device sizes
- **Muted Autoplay Compliance**: Respects browser policies while maintaining engagement

### ⚡ Performance Optimized
- **Lazy Media Loading**: Videos download only after detection, reducing initial load time
- **Efficient Resource Management**: Config-driven content loading from YAML/JSON
- **Smooth Tracking**: Hysteresis and smoothing algorithms reduce flicker and jitter

### 🤖 Time-Weave Analytics Chat (NEW)
- **Companion Oracle**: `/analytics-chat` FastAPI route orchestrated by CAMARA MaaS (mock-first, production ready).
- **Persona-Adaptive**: Priya, Jax, Lena, Mike, Amara, and Kabir personas tailor tone, media, and nudges.
- **Realtime Sessioning**: Socket.IO namespace `/analytics-socket` streams proactive alerts into the chat UI.
- **Rich Attachments**: Density overlays, itinerary CTAs, and AR previews render inline with accessible bubbles.
- **Configurable**: Switch to live CAMARA credentials via `CAMARA_*` env vars; JWT persona enforcement via `JWT_SECRET`.

---

## 🚀 Telstra Hackathon Integration

This prototype demonstrates integration with **CAMARA APIs (GSMA Open Gateway)** to showcase operator network capabilities:

### 📍 Device Location API
- **Network-Verified Location**: Obtains operator-verified device location with user consent
- **Enhanced Accuracy**: Superior to GPS, especially in indoor environments
- **Privacy-First**: Explicit consent flows and secure backend integration

### 🎯 Quality on Demand (QoD) API
- **Dynamic Network Enhancement**: Temporarily boosts network performance (latency, jitter, bandwidth)
- **Session-Based**: Activates during AR video playback for guaranteed quality
- **Automatic Management**: Seamless start/stop around media sessions

> **Note**: CAMARA API availability depends on the user's mobile operator and region. Integration requires a secure backend with OAuth2 (client credentials) against the operator's Open Gateway.

---

## 🏗️ Architecture

```mermaid
flowchart TD
  U[Browser + Camera] --> SPA[React SPA (Vite)]
  SPA -->|REST JSON| API[FastAPI /api]
  SPA --> AR[A-Frame + AR.js runtime]
  SPA --> Metrics[Zustand metrics store]
  API --> DB[(SQLite via SQLAlchemy)]
  API <-->|Seed & Export| YAML[backend/store/data/attractions.yaml]
  API --> CAMARA[CAMARA sample responses]
  API --> WS[/time-weave WebSocket/]
  SPA --> CAMARA_JS[CAMARA front-end adapter]
  API -. future .-> OPGW[Operator Open Gateway]
```

### Frontend (React + Vite)
- SPA lives in `frontend/` with TypeScript, React Router, React Query, and component-scoped CSS modules.
- AR scenes re-use A-Frame + AR.js via dynamic script loading to preserve marker, image NFT, and geo experiences.
- Admin Studio persists edits through the API (`PUT /api/attractions`) while still allowing YAML/JSON download.
- Metrics and engagement tracking use Zustand + `localStorage`, feeding the real-time dashboard visualisations.
- CAMARA helper (`services/camaraApi.ts`) mirrors the original demo flows (SIM swap, location retrieval, QoD).

### Backend (FastAPI + SQLAlchemy)
- API implemented under `backend/app` with SQLAlchemy models, CRUD helpers, and Pydantic schemas.
- SQLite database seeds from `backend/store/data/attractions.yaml` on first boot and supports full CRUD + bulk replacement.
- `/analytics-chat` and `/time-weave` reproduce the Time-Weave assistant and WebSocket echo stream.
- Serves production React build and AR media, with optional HTTPS bootstrap via `start-server.sh`.
- Configurable through env vars (`DATABASE_URL`, `CORS_ORIGINS`, etc.) with sensible defaults for local dev.

### Data & Assets
- `backend/store/data/attractions.yaml` remains the canonical definition; FastAPI exports back to YAML for version control.
- Videos, markers, NFT packs, and imagery live under `backend/store/assets/` and `backend/store/images/`, surfaced via `/assets` and `/images`.
- Local metrics stay client-side; analytics synthesis combines persisted visits with synthetic growth curves.

---

## 📊 Data Model

Attractions seed from `backend/store/data/attractions.yaml` (and persist in SQLite) with support for multiple AR types:

```yaml
- id: mcg-australia
  name: Melbourne Cricket Ground
  type: marker  # marker | imageNFT | location
  marker:
    preset: null
    patternUrl: "assets/markers/pattern-MCG_Australia.patt"
  location:
    latitude: -37.8199
    longitude: 144.9834
    radiusMeters: 100
  videoUrl: "assets/videos/Sir-Don-Bradman_100-Century_SCG_15-11-1947.mp4"
  thumbnail: "images/MCG_Australia.jpg"
  city: "Melbourne"
  description: "Experience Don Bradman's historic 100th century at the SCG"
```

### Supported AR Types
- **`marker`**: Pattern markers, preset Hiro/Kanji, or barcodes
- **`imageNFT`**: NFT-based image tracking bundles
- **`location`**: GPS geofencing with configurable radius

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ (npm)
- Modern mobile browser with camera access (Chrome, Safari, Firefox)

### Backend (FastAPI)
```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -e backend
uvicorn backend.app.main:app --reload --port 8000
```
- API available at `http://localhost:8000`
- Database stored at `backend/app.db` (auto-created + seeded from YAML)

### Frontend (React SPA)
```bash
cd frontend
npm install
npm run dev
```
- Vite serves the SPA at `http://localhost:5173`
- Dev proxy forwards `/api`, `/analytics-chat`, `/time-weave`, and asset requests to FastAPI
- Optional HTTPS for camera testing:
  ```bash
  ./generate-self-signed.sh
  npm run dev
  ```
  If `certs/localhost-*.pem` exist, Vite serves over HTTPS so mobile browsers accept camera/geolocation APIs.

### HTTPS Test Harness
Use the bundled helper to build the SPA, ensure deps exist, and start FastAPI with self-signed TLS (needed for camera + geolocation in mobile Chrome/Safari):
```bash
./start-server.sh
```
The site becomes available at `https://localhost:8443`. Accept the certificate warning and grant camera/location permissions when prompted.

### Runtime Flow (SPA)
1. React Router mounts pages for Marker, Image NFT, and Location AR modes.
2. `useAttractions` loads attractions via FastAPI (`/api/attractions`) and caches the result.
3. A-Frame scenes bootstrap once AR.js scripts finish loading (`useArScripts` hook).
4. Marker/image/location handlers lazily attach videos, request CAMARA QoD mocks, and stream metrics to Zustand.
5. Admin Studio writes updates back to the API; dashboard fuses persisted metrics with synthetic growth projections.
6. Analytics Chat page posts prompts to `/analytics-chat`, links the active session over `/analytics-socket`, and renders EchoBot’s MaaS responses + proactive nudges.

---

## 🔐 Persona Tokens & CAMARA Configuration

- Six sample JWTs live in the frontend (`SAMPLE_TOKENS`) and align with persona seeds in `backend/store/data/personas.json`.
- Backend validates tokens with `JWT_SECRET` (`time-weave-secret` by default) and merges persona traits into chat context.
- CAMARA integration defaults to mock mode (`CAMARA_USE_MOCK=true`). Override to hit live MaaS endpoints:

```bash
export CAMARA_USE_MOCK=false
export CAMARA_TOKEN_URL=https://operator.example.com/oauth2/token
export CAMARA_CLIENT_ID=...
export CAMARA_CLIENT_SECRET=...
export CAMARA_MAAS_BASE_URL=https://maas.operator.example.com
export CAMARA_MAAS_TENANT_ID=example-tenant
```

> When mock mode is disabled, MaaS orchestrator creates/updates knowledge bases and assistants per persona and relays live responses via Socket.IO.

---

## 📦 Deployment

### Docker Compose
```bash
cd frontend
./generate-self-signed.sh
cd ..
docker compose up --build
```
- Serves the API on `http://localhost:8000` and the SPA on `https://localhost:8443`
- Trust `frontend/certs/root/rootCA.pem` in your browser for warning-free HTTPS.
- Videos, markers, NFT packs, and imagery live under `backend/store/assets/` and `backend/store/images/`, surfaced via `/assets` and `/images`.

#### 🔁 Live-Reload Dev Stack (Compose v2.22+)
- Automatically watches React/TypeScript and FastAPI code for changes without restarting containers.
- Uses FastAPI `uvicorn --reload` on port `8000` and Vite’s dev server served over **HTTPS** (container port `5173`, exposed as host port `443`).

```bash
# one-time (regenerate certs if you haven't already)
./frontend/generate-self-signed.sh

# run the hot-reload stack
sudo docker compose -f docker-compose.dev.yml up
```

- Running on host port `443` typically requires elevated privileges (use `sudo` on Linux/macOS, or ensure port 443 is available on Windows).
- The Vite dev server loads the self-signed certs from `frontend/certs`; trust `frontend/certs/root/rootCA.pem` on any devices you test with to avoid browser warnings.
- Vite proxies API/asset requests to the backend container (configured via `VITE_BACKEND_HOST=backend` / `VITE_BACKEND_PORT=8000`).
- Changes under `frontend/` and `backend/app` sync straight into the dev containers; Vite + Uvicorn reload automatically.
- Stop with `CTRL+C`. No need to rebuild after each edit.

### Standalone Containers
- **Frontend**
  ```bash
  docker build -t echoes-frontend -f frontend/Dockerfile .
  docker run --rm -p 8080:80 echoes-frontend
  ```
- **Backend**
  ```bash
  docker build -t echoes-backend -f backend/Dockerfile .
  docker run --rm -p 8000:8000 echoes-backend
  ```
- When running separately, point the frontend image at the backend by providing matching network/proxy rules (see `frontend/nginx.conf`).

### Manual Production Build
```bash
npm --prefix frontend install
npm --prefix frontend run build
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
- Place behind a reverse proxy (nginx, Caddy, Traefik) for TLS in production
- Configure env vars (`DATABASE_URL`, `CORS_ORIGINS`, etc.) as needed

---

## 🛠️ Development Notes

### Permissions
- Camera and location prompts run from the React AR routes; they require HTTPS (use `start-server.sh` locally).
- Marker/Image pages gracefully degrade if permissions are denied; Location mode hides attractions until GPS lock.

### Data Management
- SQLite (`backend/app.db`) is authoritative during runtime and mirrors the YAML schema.
- Admin Studio can export fresh YAML via `/api/attractions/export` for check-in to version control.
- Haversine utilities and QoD mocks were ported intact from the legacy scripts.

### Media Loading
- Videos remain lazily loaded; React helpers attach `src` only after detection to conserve bandwidth.
- Asset folders (`backend/store/assets/videos`, `.../markers`, `.../nfts`) are served directly by FastAPI at `/assets`.
- NFT bundles (`.fset`, `.fset3`, `.iset`) are copied as-is; ensure they ship with the deployment artifact.
- A-Frame and AR.js bundles ship with the SPA (`frontend/public/scripts/**`) and are served at `/scripts/...` without external CDNs.
- AR.js bundles load per experience profile (`marker`, `image`, `marker+location`) to avoid duplicate component registration.

### Metrics & Analytics
- Zustand persist middleware keeps metrics in `localStorage` (`eternity.metrics.v1`).
- Dashboard synthesises the stored metrics with generated growth curves (see `features/dashboard/`).
- `/analytics-chat` and `/time-weave` remain mock endpoints for future operator integrations.

### Browser Compatibility
- iOS Safari 12.2+ and Android Chrome tested; desktop works for validation but may lack camera hardware.
- When testing on-device, use HTTPS and a public hostname or `