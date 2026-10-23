# Bangkok Taxi Simulation — Hybrid Digital Twin

A browser-based Three.js driving prototype for **Asok–Sukhumvit, Bangkok**.

- Real **OpenStreetMap** road and building geometry loaded at runtime via Overpass (not photorealistic facades).
- First-person taxi cockpit, steering wheel, destination HUD, and road signs (some demo signs).
- Merchant Portal prototype at `/merchant.html` to register shop pins locally.
- Vite static site deployable to Cloudflare Pages.

**This is an MVP, not a photorealistic city or a live merchant advertising platform.** Merchant records are stored in your browser only. Overpass API can time out or rate-limit. See [Phase 1 architecture and limitations](docs/PHASE1.md).

## Run

```bash
npm install
npm run dev
npm run build
```

## Deploy
Cloudflare Pages: Framework `React (Vite)`, Build command `npm run build`, output directory `dist`, branch `main`.

## Data and attribution
© OpenStreetMap contributors — [openstreetmap.org/copyright](https://www.openstreetmap.org/copyright). OSM data is licensed under ODbL. Do not scrape or reuse restricted Street View imagery or 3D tiles without an appropriate license.
