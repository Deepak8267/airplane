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
npm run typecheck
```

Copy `.env.example` values into the app-specific env files before connecting Supabase:

- `apps/mobile/.env`
- `apps/web/.env.local`

Minimum required values:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_WEB_URL=http://YOUR_LAN_IP:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase SQL Order

Run these in Supabase SQL editor in order:

1. `supabase/migrations/202606160001_initial_schema.sql`
2. `supabase/migrations/202606160002_storage.sql`
3. `supabase/migrations/202606180001_fix_auth_user_trigger.sql`
4. `supabase/migrations/202606180002_harden_signup_profile_bootstrap.sql`
5. `supabase/migrations/202606250001_harden_track_event_analytics.sql`
6. `supabase/migrations/202606260001_fix_publish_slug_and_storage.sql`
7. `supabase/seed.sql`

## Run Locally

Start the public web renderer:

```bash
npm run dev --workspace apps/web
```

Start the Expo app:

```bash
npm run start --workspace apps/mobile
```

For physical devices, set `EXPO_PUBLIC_WEB_URL` to your computer LAN URL, for example:

```bash
EXPO_PUBLIC_WEB_URL=http://192.168.1.2:3000
```

## Validation

```bash
npm run typecheck --workspace apps/mobile
npm run typecheck --workspace apps/web
npm run build --workspace apps/web
npx expo-doctor
```

Current verified status:

- Mobile typecheck passes.
- Web typecheck passes.
- Web production build passes.
- Expo Doctor passes for SDK 54.

## Current Product Notes

- Email auth is wired through Supabase Auth.
- Google and Apple buttons are visible but marked as planned until OAuth credentials are finalized.
- Razorpay UI/contracts are prepared, but payment activation is intentionally paused.
- Recipients open the Next.js web renderer at `/e/[slug]`; they do not need the mobile app.
