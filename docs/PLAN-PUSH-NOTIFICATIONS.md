# ResellerIO Mobile Push Notifications Plan

## Status

Deferred as of 2026-04-02.

This plan captures the real backend and mobile prerequisites for push notifications so we can implement them later without rediscovering the integration points.

## Goal

Add useful mobile push notifications for sellers without turning the app into noisy background spam.

Target notification families:

- Product processing complete
- Lifestyle generation complete
- New storefront inquiry

Nice-to-have later:

- Export ready
- Processing failure
- Billing or quota warnings

## Current State Analysis

### Mobile app today

- The Expo app does not currently include `expo-notifications`.
- There is no push permission flow, device token registration, notification preference UI, or deep-link handling from a notification tap.
- Mobile already has good read paths for the three target events:
  - product detail polling for AI processing
  - lifestyle run polling on product detail
  - inquiries inbox and dashboard counts

### Backend today

- Export notifications already exist, but they are email-only:
  - `Reseller.Exports.Notifier`
  - `Reseller.Exports.Notifiers.Email`
  - triggered from `Reseller.Exports.ExportWorker`
- Storefront inquiry notifications already exist, but they are email-only:
  - `Reseller.Storefronts.Notifier`
  - `Reseller.Storefronts.Notifiers.Email`
  - triggered from `Reseller.Storefronts.create_storefront_inquiry/2`
- Product processing completion does not currently route through a notifier abstraction.
- Lifestyle generation completion does not currently route through a notifier abstraction.
- There is no mobile push device table, no Expo push token storage, no register or unregister API, and no existing push delivery worker.

## Real Integration Points

These are the best current backend hook points for later push delivery:

- New inquiry:
  - `Reseller.Storefronts.create_storefront_inquiry/2`
  - today this already calls `Notifier.deliver_inquiry_received/4`
- Export ready:
  - `Reseller.Exports.ExportWorker`
  - today this already calls `Notifier.deliver_export_ready/4`
- Product processing complete:
  - `Reseller.Workers.AIProductProcessor.process/2`
  - this is where the pipeline finishes and decides the final processing step payload
- Lifestyle generation complete:
  - `Reseller.Workers.LifestyleImageGenerator.finish_run/4`
  - this is where the run becomes `completed`, `partial`, or `failed`

## Recommendation

Do not bolt push logic directly into workers or controllers.

Instead:

1. Add a dedicated mobile push device model and API.
2. Add notifier behaviors for each domain that can emit push and email independently.
3. Reuse the same domain events for both email and push when that makes sense.
4. Start with only the highest-signal notification events.

## Proposed Backend Design

### 1. Device model

Add a new table for mobile push devices, for example `mobile_push_devices`.

Suggested fields:

- `user_id`
- `expo_push_token`
- `platform`
- `device_name`
- `app_version`
- `last_seen_at`
- `notifications_enabled_at`
- `revoked_at`
- timestamps

Suggested constraints and indexes:

- unique index on `expo_push_token`
- index on `user_id`
- index on active devices such as `revoked_at IS NULL`

### 2. Public mobile API

Add public authenticated endpoints such as:

- `POST /api/v1/me/push_devices`
  - register or upsert current device token
- `DELETE /api/v1/me/push_devices/current`
  - unregister current device
- optional later: `GET /api/v1/me/notification_preferences`
- optional later: `PATCH /api/v1/me/notification_preferences`

Initial registration payload:

```json
{
  "push_device": {
    "token": "ExponentPushToken[...]",
    "platform": "ios",
    "device_name": "ResellerIO iPhone",
    "app_version": "1.0.0"
  }
}
```

### 3. Push delivery abstraction

Add a dedicated push notifier layer, for example:

- `Reseller.Notifications`
- `Reseller.Notifications.PushDevice`
- `Reseller.Notifications.Expo`
- `Reseller.Notifications.Dispatcher`

Keep the provider adapter separate from domain events so Expo-specific code stays isolated.

### 4. Domain notification hooks

Add push-capable notifier paths for:

- storefront inquiries
- product processing completion
- lifestyle generation completion

Possible structure:

- `Reseller.Storefronts.Notifier` gains push support in addition to email
- add a new `Reseller.Catalog.Notifier` or `Reseller.Products.Notifier` for processing completion
- add a dedicated notifier for lifestyle runs if product-processing and lifestyle flows need different payloads

### 5. Background delivery

Push delivery should run through background jobs, not inline request handling.

Suggested behavior:

- enqueue notification job with normalized payload
- fan out to all active devices for the user
- mark stale or invalid Expo tokens as revoked when provider responses say they are dead

## Proposed Mobile Design

### 1. Dependencies

Later add:

- `expo-notifications`
- any config plugin changes required by Expo for iOS and Android builds

### 2. Permission timing

Do not ask on first app launch.

Ask only after:

- authenticated session exists
- the user has completed at least one meaningful workflow, or
- the user explicitly enables notifications in Settings

Recommended first prompt moment:

- after first successful product finalize, or
- from a dedicated Settings prompt

### 3. Registration flow

After permission is granted:

- fetch Expo push token
- send token to backend
- persist local registration state
- refresh registration on app update or token change

On sign out:

- call unregister endpoint for the current device
- clear local registration state

### 4. Tap handling

Notification taps should deep-link into the right screen.

Initial deep-link targets:

- product processing complete:
  - `/products/:id`
- lifestyle generation complete:
  - `/products/:id`
- new inquiry:
  - `/inquiries`

### 5. Foreground behavior

If the app is already open:

- do not interrupt the seller with a full OS-level modal
- show an in-app toast or lightweight banner
- refresh the relevant screen or cache if it is visible

## Notification Payload Design

Keep payloads small and route-oriented.

Suggested common payload:

```json
{
  "type": "product_processing_completed",
  "user_id": 1,
  "product_id": 42,
  "title": "Vintage blazer",
  "route": "/products/42"
}
```

Suggested types:

- `product_processing_completed`
- `lifestyle_generation_completed`
- `storefront_inquiry_received`
- optional later: `export_ready`

## Delivery Phases

### Phase PN0: Backend prerequisites

- Add `mobile_push_devices` schema and migration
- Add register and unregister API endpoints
- Add Expo push adapter and background delivery job
- Add invalid-token cleanup behavior

Acceptance:

- Mobile can register one device token per installed app session
- Backend can store multiple active devices per user

### Phase PN1: Mobile registration plumbing

- Add `expo-notifications`
- Add permission prompt flow
- Add authenticated push registration
- Add sign-out unregister flow
- Add basic Settings visibility for current notification status

Acceptance:

- A signed-in seller can enable notifications from mobile
- Current device token reaches the backend reliably

### Phase PN2: New inquiry push

- Reuse `Reseller.Storefronts.Notifier`
- Add push delivery alongside the existing email notification
- Deep-link tap opens `Inquiries`

Acceptance:

- New storefront inquiry triggers push on an opted-in device

### Phase PN3: Product processing and lifestyle completion push

- Add notifier abstraction for product-processing completion
- Add notifier abstraction for lifestyle completion
- Deep-link taps open the product detail screen

Acceptance:

- Seller receives a push when AI processing finishes
- Seller receives a push when manual lifestyle generation finishes

### Phase PN4: Preference controls and polish

- Add per-event toggles in Settings
- Add quiet defaults to avoid notification fatigue
- Add in-app foreground banners
- Add export-ready push if still valuable after real usage

Acceptance:

- Seller can opt out of specific notification families
- Notification volume stays useful and intentional

## Product Rules

Start strict.

Send only when:

- product processing transitions into a completed seller-visible state
- a lifestyle run reaches `completed` or `partial`
- a new inquiry is created successfully

Do not send push for:

- every intermediate processing step
- every image generated inside one lifestyle run
- repeated retries unless the seller explicitly started the action

## Testing Plan

Backend:

- device registration and unregister tests
- notification job tests
- invalid token revocation tests
- domain-event tests for inquiry and processing completion

Mobile:

- permission flow tests
- token registration tests
- deep-link routing tests from tapped notification payloads
- foreground behavior tests

Manual validation:

- iOS development build
- Android development build
- permission denied then later enabled
- sign out and sign back in on the same device

## Risks And Constraints

- Expo push requires real development builds or production builds; this should not be treated as an Expo Go-only feature.
- Notification fatigue is the main UX risk, so launch with the smallest useful event set.
- If processing completion pushes are sent too early, sellers will tap into products that still look partially refreshed; the event should fire only after the final product state is committed.
- Multiple devices per seller are valid and should all receive the event unless the user disables notifications.

## Definition Of Done

Push notifications are done only when:

- current device can opt in from mobile
- backend stores and revokes device tokens safely
- new inquiry push works end-to-end
- product-processing completion push works end-to-end
- lifestyle completion push works end-to-end
- notification taps route into the correct mobile screen
- tests cover registration, dispatch, and deep-link handling
