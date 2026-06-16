# AIRPLANE

AIRPLANE is an interactive experience platform. Creators build personalized experiences in a mobile app, publish them to Supabase, and share a public web link recipients can open without installing the app.

## Apps

- `apps/mobile`: Expo React Native creator app.
- `apps/web`: Next.js 15 public experience renderer.
- `packages/shared`: Shared TypeScript contracts and constants.
- `packages/supabase`: Supabase browser/client helpers and typed query contracts.

## MVP Scope

Included: authentication, templates, experience builder, page management, publishing, public renderer, analytics, subscriptions, Razorpay contracts, and the moving `NO` proposal interaction.

Excluded: AI, marketplace, social feed, community, chat, voice generation, and video generation.

## First Run

```bash
npm install
npm run dev
```

Copy `.env.example` into the app-specific env files before connecting Supabase.
