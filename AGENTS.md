# ResellerIO Mobile Agent Guide

## Product

ResellerIO mobile is an Expo/React Native seller workspace for iOS and Android.

Core seller flow:

1. Register or sign in.
2. Create a product from photos.
3. Upload originals with signed storage URLs.
4. Finalize uploads and let the AI pipeline run.
5. Review title, attributes, pricing, and marketplace copy.
6. Generate and approve lifestyle images.
7. Choose storefront gallery images and publish the product.
8. Manage inquiries, storefront settings, and account defaults.

This repo is the mobile client. The Phoenix backend in `~/www/elixir/reseller` is the product and API source of truth.

## Source Of Truth

- Mobile app repo: `~/www/elixir/resellerio-app`
- Backend repo: `~/www/elixir/reseller`
- Backend guide: `~/www/elixir/reseller/AGENTS.md`
- API docs: `~/www/elixir/reseller/docs/API.md`
- Mobile API guide: `~/www/elixir/reseller/docs/MOBILE_API_GUIDE.md`
- Architecture docs: `~/www/elixir/reseller/docs/ARCHITECTURE.md`
- Push notifications plan: `~/www/elixir/resellerio-app/docs/PLAN-PUSH-NOTIFICATIONS.md`
- Web functionality reference: `~/www/elixir/reseller/lib/reseller_web/live/*`
- Interactive API docs: `http://localhost:4000/docs/api`
- OpenAPI: `http://localhost:4000/api/v1/openapi.json`
- Production host: `https://resellerio.com`

When backend docs and backend code disagree, trust backend code.

## Stack

- Expo Router
- React Native
- TypeScript
- Local API base:
  - iOS simulator: `http://localhost:4000/api/v1`
  - Android emulator: `http://10.0.2.2:4000/api/v1`
  - Physical device: use the host machine LAN IP, never `localhost`
- Production API base: `https://resellerio.com/api/v1`

Keep environment and API base URL logic in one place. Do not scatter host detection across screens.

## Product Surfaces

- Auth: register, sign in, sign out, restore session
- Inventory: products list, filters, search, tabs, product detail
- Inventory filters: status, product tab, sort, and updated-date filtering
- Home: mobile dashboard summary, recent activity, and quick actions
- Intake: create product, upload photos, finalize uploads
- Review: AI summary, description draft, price research, marketplace listings
- Media: originals, background-removed images, lifestyle generation, storefront selection
- Storefront: publish product, storefront settings, theme, pages, branding assets
- Share: public storefront URL open/share and public product URL open/share
- Inquiries: searchable inbox for storefront leads
- Account: marketplace defaults, plan usage, billing links
- Transfers: catalog export download and ZIP import status

## Mobile Architecture Rules

- Keep business logic out of screens.
- Centralize HTTP calls in a dedicated API layer.
- Centralize auth/session persistence in one module.
- Prefer feature-oriented modules over screen-only code sprawl.
- Keep UI state, server state, and upload orchestration separate.
- Do not duplicate backend enums, statuses, or response shapes by hand if generated types or shared schemas are available.
- Preserve raw backend status values in state and map them to UI labels separately.

Recommended target structure:

- `app/` for Expo Router screens and layouts
- `src/features/auth/`
- `src/features/products/`
- `src/features/inquiries/`
- `src/features/settings/`
- `src/features/transfers/`
- `src/lib/api/`
- `src/lib/auth/`
- `src/lib/config/`
- `src/lib/storage/`
- `src/components/`
- `src/types/`

## API And Auth Rules

- The current backend uses bearer API tokens, not JWT refresh flows.
- Store tokens in secure storage only.
- Restore session on launch, then hydrate with `GET /api/v1/me`.
- Load `GET /api/v1/me/usage` for limits, quotas, and upgrade messaging.
- Treat `401` as session loss: clear credentials and route back to auth.
- Treat `402 limit_exceeded` as a product state, not a generic crash.
- A 1-year mobile session is now supported by backend token TTL configuration.
- Public API `id` and `*_id` fields now use ULID strings. Do not coerce route params or serialized IDs with `Number(...)`, and keep local recent-ID caches string-based too.

Important current backend fact:

- `Reseller.Accounts.api_token_ttl_days` is configured to `365` days in `~/www/elixir/reseller/config/config.exs`.

## Upload And Processing Rules

Product image upload is a three-step flow:

1. `POST /api/v1/products` with `product` and optional `uploads`
2. Upload each file directly to the returned signed `upload_url`
3. `POST /api/v1/products/:id/finalize_uploads`

After finalization:

- product status moves into `processing`
- AI work runs asynchronously
- mobile should poll `GET /api/v1/products/:id`
- UI must show queued, running, completed, and failed states clearly

Lifestyle generation is also asynchronous:

- `POST /api/v1/products/:id/generate_lifestyle_images`
- poll `GET /api/v1/products/:id` and optionally `GET /api/v1/products/:id/lifestyle_generation_runs`

Transfers are asynchronous too:

- `POST /api/v1/exports`
- `GET /api/v1/exports/:id`
- `POST /api/v1/imports`
- `GET /api/v1/imports/:id`

Important current backend fact:

- Transfers do not have public list endpoints yet, so mobile must persist recent export/import IDs locally and rehydrate status cards from those IDs.

## Web Parity Gaps To Respect

The web workspace already supports some behaviors that mobile still needs to catch up on.

Known gaps from backend analysis:

- Dashboard and a few polish flows still trail the web workspace.

Do not paper over these gaps with fragile client-only state. If mobile parity depends on them, extend the backend contract first.

## Current Mobile Progress

Completed in the app:

- Native splash and animated intro splash branded with the current ResellerIO backend logo
- Inline page-header branding with the backend logo on the same row as each main screen title
- Home dashboard tab with account summary, product and inquiry metrics, tracked transfer counts, quota visibility, quick actions, and recent products
- Auth with secure persistence and bearer token restore
- Products list, tabs, search, pagination, and detail
- Products hidden search modal with active-query summary and normalized search state
- Clickable external-link actions for storefront URLs, inquiry source paths, marketplace live URLs, and image URLs
- Products advanced sorting and updated-date filters via modal controls
- Product detail polish: selectable text, streamlined storefront/review copy, simpler original-image actions, and copy-to-clipboard controls for marketplace listing blocks
- Product detail media polish: lifestyle and storefront-gallery thumbnails, simplified add/remove storefront actions, and a standard bottom navigation footer on the Product screen
- Lifestyle image cards now stay minimal on Product detail, showing the preview and seller actions without extra scene, approval, or source-image metadata
- Lifestyle image actions now use compact icon controls for regenerate, one-way approve status, and delete with confirmation, while tapping the image itself opens the full preview
- Storefront Gallery selection now uses a top-right circle toggle instead of add/remove buttons
- Storefront Gallery now keeps images in one stable list and places the selection toggle directly over the image preview
- Inquiries inbox now uses compact rows with full name, contact, and received-at time, opening a detail dialog for message review and delete
- Upload-first product intake with signed uploads and finalize
- Product review editing and lifecycle actions
- Original/background-removed image preview, full-screen media lightbox, and lifestyle preview actions
- Lifestyle generation controls, regenerate-all and regenerate-by-scene actions, approval/delete actions, storefront image selection/order, and storefront publish/share flows
- Inquiries inbox with search, pagination, delete, and open-product action
- Settings workspace with marketplace defaults, storefront profile, branding assets, storefront pages, usage/account, storefront open/share, billing links, and sign out
- Settings storefront profile uses one clickable public URL, logo/header previews, shorter branding/save labels, and icon-based page controls with delete confirmation
- Settings now consumes backend storefront theme presets and shows mobile theme preview cards with a show-more toggle instead of a raw theme ID field
- Marketplace selection now lives inside a dedicated Marketplaces block with shorter save copy, and branding blocks hide filename/size details when previews are available
- Settings Logo/Header branding cards now use compact upload and trash icon actions instead of text buttons
- External link opening/sharing is now gated through a shared safe-URL helper that blocks unsupported schemes and unsafe public `http://` links
- External link opening/sharing also blocks URLs with embedded credentials such as `https://user:pass@host/...`
- API response parsing now fails safely on non-JSON responses, and web auth fallback storage is session-scoped instead of long-lived local storage
- API requests fail closed on redirects so bearer-auth API calls do not silently follow unexpected redirect chains
- Expo Go on physical devices now prefers Expo's detected LAN host for local API calls instead of `localhost`, but Phoenix dev must also bind to `0.0.0.0` for phone access
- Environment setup now includes a committed `.env.production` for production API builds and a `.env.local.example` template for machine-specific local LAN API URLs
- Product detail processing errors are sanitized on mobile so internal backend dumps like raw `Ecto.Changeset` strings do not leak into seller-facing UI
- Transfers workspace in Settings with catalog export creation, finished-download open action, ZIP import, and recent transfer polling
- Public API ULID migration completed in mobile models, route params, product/media actions, storefront page actions, inquiry deletes, and transfer history caches

Still in progress:

- Better share refinements, notifications, and production polish

## Testing

- Add tests for every auth, session, upload, product-state, or API-contract change.
- Cover happy path plus expired token, malformed token, missing token, and ownership errors.
- Add focused tests for upload orchestration and poll-driven state transitions.
- Verify both iOS and Android behavior for media picking and direct uploads.
- Run `npm run lint` before closing work.

## Naming

Use backend nouns:

- `User`
- `Product`
- `ProductImage`
- `ProductTab`
- `MarketplaceListing`
- `Storefront`
- `StorefrontPage`
- `StorefrontInquiry`

Avoid inventing parallel names like `asset`, `listingItem`, or `inventoryCard` for domain models unless the distinction is real and documented.
