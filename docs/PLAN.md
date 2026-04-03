# ResellerIO Mobile Plan

## Goal

Build a React Native mobile app for iOS and Android that is as close as practical to the current web seller workspace, while using the existing `/api/v1` backend as the contract.

Primary seller journey:

- Registration / sign in
- Stay signed in on device
- Add product
- Upload photos
- Finalize uploads
- Review AI-generated data
- Get background-removed images
- Generate lifestyle images
- Select and order storefront gallery images
- Publish and share to storefront
- Manage inquiries
- Manage settings, storefront, and marketplace defaults

## Implementation Log

- [x] 2026-04-01 Step 1: Replaced the default Expo starter routes with a real auth-first mobile shell.
- [x] 2026-04-01 Step 2: Added API base URL config for local development and production.
- [x] 2026-04-01 Step 3: Added a typed API client, bearer-token auth requests, and shared API error formatting.
- [x] 2026-04-01 Step 4: Added secure session persistence with `expo-secure-store` plus web fallback storage.
- [x] 2026-04-01 Step 5: Implemented register, sign-in, sign-out, and session restore on app launch.
- [x] 2026-04-01 Step 6: Hydrated authenticated state with `GET /api/v1/me` and `GET /api/v1/me/usage`.
- [x] 2026-04-01 Step 7: Added protected `Products`, `Inquiries`, and `Settings` tabs as the foundation for the next feature slices.
- [x] 2026-04-01 Step 8: Added Jest/Expo unit test infrastructure and a `npm test` workflow.
- [x] 2026-04-01 Step 9: Implemented the first real Products screen backed by `GET /api/v1/products`.
- [x] 2026-04-01 Step 10: Implemented product-tab list and create flows backed by `GET /api/v1/product_tabs` and `POST /api/v1/product_tabs`.
- [x] 2026-04-01 Step 11: Added unit tests for API error handling and products overview state logic.
- [x] 2026-04-01 Step 12: Implemented product-tab rename and delete flows backed by `PATCH /api/v1/product_tabs/:id` and `DELETE /api/v1/product_tabs/:id`.
- [x] 2026-04-01 Step 13: Added unit tests for product-tab rename and delete behavior, including active-filter reset after deletion.
- [x] 2026-04-01 Step 14: Refactored protected routing to use tabs plus stack detail screens without turning product detail into another tab.
- [x] 2026-04-01 Step 15: Implemented the first product detail screen backed by `GET /api/v1/products/:id`.
- [x] 2026-04-01 Step 16: Added unit tests for product detail loading and refresh behavior.
- [x] 2026-04-01 Step 17: Moved Create Tab and Manage Tabs behind on-demand modal dialogs so the Products screen stays focused by default.
- [x] 2026-04-01 Step 18: Moved `+ Create Tab` into the horizontal tab list and changed active custom tabs to open their manage modal from a small `...` action.
- [x] 2026-04-01 Step 19: Added the mobile upload-first New Product screen, optional tab selection, signed upload preparation, and redirect into product detail after finalization.
- [x] 2026-04-01 Step 20: Added a local intake queue with queued/uploading/uploaded/failed per-image states plus retry and start-over actions for failed uploads.
- [x] 2026-04-01 Step 21: Added unit tests for intake payload/orchestration helpers and the mobile intake hook.
- [x] 2026-04-01 Step 22: Added a product-detail processing banner plus background polling while uploads or AI processing are still active.
- [x] 2026-04-01 Step 23: Added unit tests for product-detail polling and automatic stop once the product reaches review.
- [x] 2026-04-01 Step 24: Added the first editable mobile review form for seller-managed product fields, including status and tab updates.
- [x] 2026-04-01 Step 25: Added unit tests for review draft building, dirty-state preservation during refresh, and `PATCH /api/v1/products/:id` save behavior.
- [x] 2026-04-02 Step 26: Added right-side copy-to-clipboard actions to product review form inputs for faster reuse of field values on mobile.
- [x] 2026-04-02 Step 27: Added quick product lifecycle actions on detail for retry AI, mark sold, archive or restore, and delete with confirmation.
- [x] 2026-04-02 Step 28: Added unit tests for product-detail lifecycle mutations, including reprocess, sold or archive flows, and delete.
- [x] 2026-04-02 Step 29: Audited the local Phoenix backend and marked Phase 0 backend parity prerequisites complete for the public mobile API.
- [x] 2026-04-02 Step 30: Expanded product detail with richer storefront, AI summary, description draft, price research, and marketplace listing panels backed by the new API fields.
- [x] 2026-04-02 Step 31: Added unit tests for the new product-detail presentation helpers and detail screen rendering.
- [x] 2026-04-02 Step 32: Added product-detail lifestyle generation controls, run history, and seller approval or delete actions backed by the public mobile API.
- [x] 2026-04-02 Step 33: Added storefront gallery selection and reordering controls for ready product images on mobile.
- [x] 2026-04-02 Step 34: Added unit tests for the new media helpers plus product-detail media and storefront mutations.
- [x] 2026-04-02 Step 35: Replaced the inquiries placeholder with a real mobile inbox backed by `GET /api/v1/inquiries`.
- [x] 2026-04-02 Step 36: Added inquiry search, pagination, delete, and linked-product navigation actions on mobile.
- [x] 2026-04-02 Step 37: Added unit tests for inquiry inbox state and screen rendering.
- [x] 2026-04-02 Step 38: Replaced the settings placeholder with a real account/storefront workspace backed by `GET /api/v1/me`, `GET /api/v1/me/usage`, and `GET /api/v1/storefront`.
- [x] 2026-04-02 Step 39: Added marketplace defaults saving, storefront profile editing, and storefront page create/edit/delete/reorder flows on mobile.
- [x] 2026-04-02 Step 40: Added unit tests for settings overview state, storefront page mutations, and settings screen rendering.
- [x] 2026-04-02 Step 41: Added storefront branding upload and delete flows for logo and header assets using the public mobile API plus direct signed uploads.
- [x] 2026-04-02 Step 42: Added a richer subscription/account section with pricing and billing deep links in mobile Settings.
- [x] 2026-04-02 Step 43: Added unit tests for storefront branding helpers, branding mutations, and new Settings account actions.
- [x] 2026-04-02 Step 44: Replaced the old image-count-only detail view with real original and background-removed image preview panels backed by the new public image URLs.
- [x] 2026-04-02 Step 45: Added full-screen image preview, storefront publication controls, marketplace live URL editing, and public product share actions on product detail.
- [x] 2026-04-02 Step 46: Added unit tests for new image preview helpers, publication draft state, storefront slug loading, and public URL actions.
- [x] 2026-04-02 Step 47: Added lifestyle-scene regeneration controls so mobile can rerun the default set or a single `scene_key` directly from product detail.
- [x] 2026-04-02 Step 48: Added unit tests for scene-key helper formatting, scene-specific generation calls, and the new lifestyle shortcut UI.
- [x] 2026-04-02 Step 49: Added a dedicated mobile transfers feature with recent export and import history persisted locally because the public API exposes create and status endpoints, not list endpoints.
- [x] 2026-04-02 Step 50: Added a new Settings transfers section for catalog export creation, ZIP import, active-job polling, and finished export download actions.
- [x] 2026-04-02 Step 51: Added unit tests for transfers helpers, transfers state, and the new Settings transfers actions.
- [x] 2026-04-02 Step 52: Added a new mobile Home dashboard tab with account summary, quick actions, recent products, and quota visibility.
- [x] 2026-04-02 Step 53: Added dashboard stats backed by existing APIs for total products, ready products, processing products, inquiries, and locally tracked transfer counts.
- [x] 2026-04-02 Step 54: Added unit tests for dashboard state loading, refresh behavior, and Home screen rendering.
- [x] 2026-04-02 Step 55: Added storefront open/share actions in mobile Settings so sellers can launch or share their public storefront URL directly from the app.
- [x] 2026-04-02 Step 56: Added environment-aware storefront URL helpers and unit tests for the new storefront sharing actions.
- [x] 2026-04-02 Step 57: Audited the current backend and mobile notification surface and extracted the deferred push-notifications work into `docs/PLAN-PUSH-NOTIFICATIONS.md`.
- [x] 2026-04-02 Step 58: Added advanced product sorting and updated-date filters backed by the existing `GET /api/v1/products` query contract.
- [x] 2026-04-02 Step 59: Added a dedicated Products filters modal so advanced sort and date controls do not clutter the main inventory workspace.
- [x] 2026-04-02 Step 60: Added unit tests for product query building, advanced filter hook behavior, and the Products filters modal.
- [x] 2026-04-02 Step 61: Replaced the default Expo splash asset with the backend `logo.png` and added a branded animated intro splash overlay on app launch.
- [x] 2026-04-02 Step 62: Added unit tests for the intro splash timing and finish callback behavior.
- [x] 2026-04-02 Step 63: Reworked page headers so the ResellerIO logo sits inline with each main screen title instead of consuming a separate top band, and updated shared UI tests for the new branded title pattern.
- [x] 2026-04-02 Step 64: Added clickable browser-opening links for storefront URLs, inquiry source paths, marketplace live URLs, and image URLs, plus unit and screen tests for the new link behavior.
- [x] 2026-04-02 Step 65: Collapsed the Products search panel behind a magnifier action and moved search into an on-demand modal, with screen tests covering the hidden-by-default flow.

## Current Web Functionality Analyzed

Current web seller surfaces in `~/www/elixir/reseller`:

- `/app` dashboard with inventory summary and quick actions
- `/app/products` products table with filters, search, sort, pagination, tabs, and exports
- `/app/products/new` upload-first intake flow
- `/app/products/:id` AI review, pricing, listings, image management, lifestyle previews, storefront publishing
- `/app/inquiries` searchable storefront inquiry inbox
- `/app/settings` storefront profile, theme presets, pages, branding assets, marketplace defaults, subscription/account
- `/app/exports` exports and imports

Current mobile-facing API already covers:

- Auth
- User profile
- Usage counters and limits
- Product tabs
- Products list/detail/create/update/delete
- Initial image upload finalization
- Reprocess
- Lifestyle image generation and approval
- Inquiries list/delete
- Storefront profile and page CRUD
- Exports and imports

## Product Decisions

- [x] Use the existing bearer token API as the default mobile auth approach
- [x] Keep the user signed in for 1 year on one device
- [x] Mirror the web upload-first product intake flow
- [x] Mirror the web product review flow
- [x] Include Inquiries
- [x] Include Settings with Storefront and marketplace defaults
- [ ] Add full mobile parity for every storefront publishing detail currently available in web

Notes:

- Backend mobile API token TTL is now configured to `365` days as of 2026-04-02.
- The current bearer-token design is still the default mobile auth approach, so no refresh-token/JWT migration is required for the planned v1 session lifetime.

## Phase 0: Backend Parity Prerequisites

These are backend tasks required for real mobile parity with the existing web workspace.

- [x] Change mobile auth lifetime from 30 days to 365 days, or add refresh-token support
- [x] Return an absolute pricing URL in `402 limit_exceeded` responses for mobile upgrade CTAs
- [x] Expose `storefront_enabled` and `storefront_published_at` in `GET /api/v1/products/:id`
- [x] Expose `storefront_visible` and `storefront_position` on product images in product responses
- [x] Expose marketplace listing `external_url` fields in product responses
- [x] Accept marketplace external URLs in a public mobile API endpoint
- [x] Add public mobile API support for uploading storefront logo assets
- [x] Add public mobile API support for uploading storefront header assets
- [x] Add public mobile API support to reorder storefront pages
- [x] Add public mobile API support to prepare uploads for an existing product so mobile can match the web "upload new images" flow on the review screen

Phase 0 backend parity is complete as of 2026-04-02, so the remaining mobile work can target the full public API surface instead of web-only fallbacks.

## Phase 1: App Foundation

- [x] Replace the Expo starter screens with the real app shell
- [x] Add environment config for local, simulator, device, and production API hosts
- [x] Add typed API client and centralized error handling
- [x] Add secure token storage and session bootstrap
- [x] Add auth guard and protected-app routing
- [x] Add unit test infrastructure and `npm test`
- [ ] Add loading, empty, error, and retry states shared across the app
- [ ] Add analytics/event hooks only after the primary flows are stable

## Phase 2: Registration And Sign In

- [x] Registration screen using `POST /api/v1/auth/register`
- [x] Sign-in screen using `POST /api/v1/auth/login`
- [x] Persist token securely after auth
- [x] Restore session on launch and hydrate with `GET /api/v1/me`
- [x] Load `GET /api/v1/me/usage` after sign-in for plan and quota state
- [x] Sign-out flow that clears local session immediately
- [x] Friendly handling for `401`, validation errors, and expired tokens

Acceptance:

- User can create an account from mobile
- User can sign in again on the same device
- User session survives app restarts
- Final "1 year login" acceptance depends on Phase 0 auth work

## Phase 3: Navigation And Information Architecture

Recommended mobile structure:

- [x] Auth stack: Register, Sign in
- [x] Main tabs: Products, Inquiries, Settings
- [x] Product stack: Products list, New Product, Product Detail
- [x] Optional dashboard/home tab if we want a mobile summary screen similar to web
- [ ] Modal or sheet flows for filters, product tabs, image preview, and destructive confirmations

Recommendation:

- Start with `Products`, `Inquiries`, and `Settings` tabs
- Put dashboard metrics inside `Products` header or a later `Home` tab
- Keep exports/imports as a later phase or a nested Settings/Transfers screen

## Phase 4: Inventory List And Product Tabs

- [x] Products list using `GET /api/v1/products`
- [x] Status filters: `all`, `draft`, `uploading`, `processing`, `review`, `ready`, `sold`, `archived`
- [x] Search by query
- [x] Sort
- [x] Pagination
- [x] Updated date filters
- [x] Product tab filter
- [x] Product tabs list/create using `/api/v1/product_tabs`
- [x] Product tabs rename/delete using `/api/v1/product_tabs`
- [x] Pull-to-refresh and infinite pagination or explicit next-page loading
- [x] Empty states for no products and no search matches
- [x] Product detail navigation and `GET /api/v1/products/:id`

Acceptance:

- User can find a product quickly
- User can organize inventory with product tabs
- User can open product detail from list reliably

## Phase 5: New Product Intake

Mirror the current web `/app/products/new` flow.

- [x] New Product screen with optional tab selection
- [x] Camera and photo library multi-select
- [x] Local upload queue with filename, size, and preview
- [x] `POST /api/v1/products` with `uploads`
- [x] Direct `PUT` upload to each signed storage URL
- [x] `POST /api/v1/products/:id/finalize_uploads`
- [x] Redirect user into Product Detail after finalize
- [x] Show upload progress and actionable failure states per file

Acceptance:

- User can create a product from photos without leaving mobile
- Upload failures are recoverable
- Processing starts automatically after finalization

## Phase 6: Product Review And Lifecycle

Mirror the current web `/app/products/:id` review experience.

- [x] Product detail screen using `GET /api/v1/products/:id`
- [x] Processing banner and poll loop while AI is running
- [x] Review/edit fields: title, brand, category, condition, color, size, material, SKU, tags, price, cost, notes, status, tab
- [x] AI summary panel
- [x] Description draft panel
- [x] Price research panel
- [x] Marketplace listings panel
- [x] Save product changes with `PATCH /api/v1/products/:id`
- [x] Reprocess with `POST /api/v1/products/:id/reprocess`
- [x] Mark sold
- [x] Archive / unarchive
- [x] Delete product

Acceptance:

- User can fully review and edit AI-generated product data
- User can retry failed processing
- User can manage lifecycle without returning to web

## Phase 7: Media, Lifestyle Images, And Storefront Gallery

- [x] Display original images
- [x] Display background-removed images when ready
- [x] Full-screen image preview
- [x] Generate lifestyle images with `POST /api/v1/products/:id/generate_lifestyle_images`
- [x] Poll lifestyle runs and show run history
- [x] Approve a lifestyle image
- [x] Delete a lifestyle image
- [x] Regenerate all or regenerate by scene when backend supports the UI cleanly
- [x] Choose which images belong in the storefront gallery
- [x] Reorder storefront gallery images
- [x] Publish product to storefront
- [x] Share public product URL once publication fields are exposed in the API

Dependency note:

- Backend storefront image and publication fields are now available in the mobile API, and mobile image rendering is now wired to the public `images[*].url` fields.

## Phase 8: Inquiries

- [x] Inquiries list using `GET /api/v1/inquiries`
- [x] Search by name, contact, or message
- [x] Pagination
- [x] Inquiry row showing contact, message, product reference, and source path
- [x] Delete inquiry with `DELETE /api/v1/inquiries/:id`
- [x] Optional quick action to open related product detail

Acceptance:

- Seller can triage storefront leads entirely from mobile

## Phase 9: Settings, Storefront, And Account

Mirror the important parts of web `/app/settings`.

- [x] Marketplace defaults using `GET /api/v1/me` and `PATCH /api/v1/me`
- [x] Storefront profile using `GET /api/v1/storefront` and `PUT /api/v1/storefront`
- [x] Storefront fields: enabled, slug, title, tagline, description, theme
- [x] Storefront branding assets: logo/header upload, replace, and delete
- [x] Storefront pages list/create/update/delete
- [x] Storefront page editor for About, Shipping, Returns, and similar content
- [x] Usage and quota screen using `GET /api/v1/me/usage`
- [x] Subscription/account section using `plan`, `plan_status`, `plan_expires_at`, `trial_ends_at`, and `addon_credits`
- [x] Deep link to `https://resellerio.com/pricing`
- [x] Deep link to billing management if required
- [x] Sign out

Settings API parity note:

- Storefront logo upload, header upload, and page reordering are now implemented in the mobile app against the public API.

## Phase 10: Optional Web-Parity Extensions

Useful after the main seller flow is stable.

- [x] Dashboard summary screen similar to `/app`
- [x] Exports flow using `POST /api/v1/exports` and `GET /api/v1/exports/:id`
- [x] Imports flow using `POST /api/v1/imports` and `GET /api/v1/imports/:id`
- [x] Better sharing actions for storefront and product URLs
- [ ] Push notifications for processing complete, lifestyle generation complete, and new inquiries
  Deferred to `docs/PLAN-PUSH-NOTIFICATIONS.md`
- [ ] Offline draft capture before upload
- [ ] Crash reporting and production analytics

Phase 10 note:

- Mobile stores recent export and import IDs locally and re-fetches them on refresh because the public API does not expose list endpoints for transfers yet.
- Mobile dashboard uses current public API counts for products and inquiries, then combines those with device-tracked transfer counts for a practical `/app`-style home tab.

## Suggested Delivery Order

- [x] Milestone 1: App foundation + auth
- [x] Milestone 2: Products list + tabs + basic detail
- [x] Milestone 3: New product intake + upload + processing poll
- [x] Milestone 4: Full review flow + lifecycle actions
- [x] Milestone 5: Lifestyle images + storefront gallery
- [x] Milestone 6: Inquiries
- [x] Milestone 7: Settings + storefront + usage/account
- [ ] Milestone 8: Exports/imports, dashboard, notifications, polish

## Definition Of Done For V1

- [x] User can register and sign in from mobile
- [x] User session is persistent and meets the final agreed auth lifetime
- [x] User can create a product from photos
- [x] User can wait for AI processing and review results
- [x] User can edit product details and manage lifecycle
- [x] User can generate and approve lifestyle images
- [x] User can manage storefront-related product image selection
- [x] User can publish products to storefront once required API fields exist
- [x] User can read and clear inquiries
- [x] User can update storefront settings and marketplace defaults
- [ ] App works on both iOS and Android
