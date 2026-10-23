# Bangkok Hybrid Digital Twin — Phase 1

## Scope
- Client-side Three.js driving cockpit
- OpenStreetMap roads and building footprints around Asok–Sukhumvit, loaded at runtime from public Overpass API
- Coordinate projection anchored at 13.7379, 100.5605 (approximate local meters)
- In-game simple directional navigation to sample points (NOT road routing)
- Merchant demo at /merchant.html, saved to browser localStorage; in-game pins are visible after reload
- Vite multipage static build; Cloudflare Pages compatible

## Important limitations
1. Buildings are extruded footprints with estimated heights, NOT photographs or exact facades.
2. Live Overpass API can rate-limit, time out or be inaccessible; no map tiles are stored on this deployment.
3. Merchant records are local to one browser; they are NOT publicly published or synchronized across users.
4. No real authentication, ownership verification, payment, advertising inventory or moderation exists.
5. No traffic, collision, real road routing or guaranteed map freshness yet.
6. OSM attribution is required and data use is governed by ODbL. Verify other data licenses before mixing sources.
7. Location names and signs may be approximations, not verified current road signage.

## Production architecture
- Frontend: React/Three.js or React Three Fiber, chunked map streaming, model LOD and mobile performance budgets
- Map ingestion: OSM extracts -> PostGIS roads, footprints, POIs -> vector tiles/3D scene API
- Business API: NestJS + PostgreSQL/PostGIS, object storage for merchant-uploaded media
- Merchant tables: merchants(id,owner_user_id,name,category,location,verified_at,status), merchant_media, merchant_claims, moderation_reviews
- Ads: ad_inventory(id,scene_anchor,policy), campaigns(merchant_id,creative_id,start_at,end_at,budget,status), impressions, billing
- Auth/RBAC: merchant, moderator, admin; ownership claim and review workflow
- Payment: provider checkout, server-side webhooks, invoices, refunds, and audit log
- Do not let merchant data overwrite real traffic signs. Label sponsored content distinctly.

## Next development milestones
1. Move Overpass querying to scheduled ingestion and persist map data in PostGIS.
2. Replace basic buildings with licensed textured landmark assets and storefront photos.
3. Implement road graph navigation and realistic vehicle physics/collision.
4. Merchant auth, geolocation verification, approval, media uploads and shared API.
5. Ad moderation and billing only after the above security controls are ready.

## Local
npm install
npm run dev
npm run build

Cloudflare Pages: React (Vite) preset, build command `npm run build`, output `dist`.
