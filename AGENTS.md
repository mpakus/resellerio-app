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
- Intake: create product, upload photos, finalize uploads
- Review: AI summary, description draft, price research, marketplace listings
- Media: originals, background-removed images, lifestyle generation, storefront selection
- Storefront: publish product, storefront settings, theme, pages, branding assets
- Inquiries: searchable inbox for storefront leads
- Account: marketplace defaults, plan usage, billing links

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
- Do not claim "1 year login" is already implemented unless backend token TTL is changed to match it.

Important current backend fact:

- `Reseller.Accounts.api_token_ttl_days` is configured to `30` days in `~/www/elixir/reseller/config/config.exs`.
- If product requires "stay logged in for 1 year", backend config or auth design must change before we promise it in the app.

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

## Web Parity Gaps To Respect

The web workspace already supports some behaviors that the public mobile API does not fully expose yet.

Known gaps from backend analysis:

- No mobile API endpoint yet for storefront logo upload
- No mobile API endpoint yet for storefront header upload
- No mobile API endpoint yet to reorder storefront pages
- No public API endpoint yet to prepare new uploads for an existing product detail screen
- `product_json/1` does not currently expose `storefront_enabled` or `storefront_published_at`
- `image_json/1` does not currently expose `storefront_visible` or `storefront_position`
- `marketplace_listing_json/1` does not currently expose seller `external_url`
- The web product review flow updates marketplace external URLs through server-side LiveView code, not the public mobile API

Do not paper over these gaps with fragile client-only state. If mobile parity depends on them, extend the backend contract first.

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
