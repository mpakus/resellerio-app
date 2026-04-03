# ResellerIO Mobile App

Expo + React Native mobile app for ResellerIO sellers on iOS and Android.

The app mirrors the web seller workspace as closely as practical against the existing Phoenix `/api/v1` backend. Current mobile coverage includes auth, products, upload-first intake, AI review, lifestyle images, storefront controls, inquiries, settings, transfers, and the home dashboard.

## Backend

- Local web/API: [http://localhost:4000](http://localhost:4000)
- API docs: [http://localhost:4000/docs/api](http://localhost:4000/docs/api)
- OpenAPI: [http://localhost:4000/api/v1/openapi.json](http://localhost:4000/api/v1/openapi.json)
- Production base URL: [https://resellerio.com](https://resellerio.com)

The backend project lives at `/Users/mpak/www/elixir/reseller`.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the Expo app:

```bash
npm start
```

3. Run on a simulator/device:

```bash
npm run ios
npm run android
```

By default the app uses:

- iOS / web dev API: `http://localhost:4000/api/v1`
- Android emulator dev API: `http://10.0.2.2:4000/api/v1`
- Production API: `https://resellerio.com/api/v1`

You can override the API base with:

```bash
EXPO_PUBLIC_API_BASE_URL=https://resellerio.com/api/v1 npm start
```

## Test Account

Use the local seller account for development and manual testing:

- Email: `seller@reseller.local`
- Password: `very-secure-password`

## Scripts

- `npm start` - start Expo
- `npm run ios` - open iOS simulator flow
- `npm run android` - open Android emulator flow
- `npm run web` - run Expo web
- `npm run lint` - run lint checks
- `npm test` - run Jest tests

## Project Structure

- [`app`](/Users/mpak/www/elixir/resellerio-app/app) - Expo Router screens
- [`src/components`](/Users/mpak/www/elixir/resellerio-app/src/components) - shared UI building blocks
- [`src/features/products`](/Users/mpak/www/elixir/resellerio-app/src/features/products) - products, intake, detail, review, storefront, lifestyle
- [`src/features/inquiries`](/Users/mpak/www/elixir/resellerio-app/src/features/inquiries) - inquiry inbox
- [`src/features/settings`](/Users/mpak/www/elixir/resellerio-app/src/features/settings) - storefront profile, themes, branding, pages, account settings
- [`src/features/transfers`](/Users/mpak/www/elixir/resellerio-app/src/features/transfers) - exports and imports
- [`src/features/dashboard`](/Users/mpak/www/elixir/resellerio-app/src/features/dashboard) - home/dashboard
- [`src/lib`](/Users/mpak/www/elixir/resellerio-app/src/lib) - auth, API client, storage, config, URL safety helpers
- [`docs/PLAN.md`](/Users/mpak/www/elixir/resellerio-app/docs/PLAN.md) - implementation log and current delivery plan

## Security Notes

Recent hardening in this repo:

- External links are validated before opening or sharing. The app allows:
  - `https://...`
  - local-development `http://...` URLs such as `localhost`, `10.0.2.2`, private LAN ranges, and `.local`
- Unsupported schemes like `javascript:` and unsafe public `http://` URLs are blocked
- API responses are parsed defensively so non-JSON proxy/server errors fail safely instead of crashing the client
- Native auth persistence uses Expo SecureStore
- Web fallback auth persistence now uses session-scoped storage instead of long-lived `localStorage`

## Documentation

- Mobile implementation plan: [docs/PLAN.md](/Users/mpak/www/elixir/resellerio-app/docs/PLAN.md)
- Deferred push notifications plan: [docs/PLAN-PUSH-NOTIFICATIONS.md](/Users/mpak/www/elixir/resellerio-app/docs/PLAN-PUSH-NOTIFICATIONS.md)
- Contributor notes: [AGENTS.md](/Users/mpak/www/elixir/resellerio-app/AGENTS.md)

## Verification

Recommended local verification before shipping:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
```
