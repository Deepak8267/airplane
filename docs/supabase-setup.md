# Supabase Setup

## Local

```bash
npx supabase start
npx supabase db reset
```

## Auth Providers

Enable:

- Email/password
- Google OAuth
- Apple OAuth

Redirect URLs:

- `airplane://auth/callback`
- `https://airplane.app/auth/callback`
- `http://localhost:3000/auth/callback`

## Storage Buckets

Created by migration:

- `avatars`
- `covers`
- `photos`
- `templates`

Path convention:

- `avatars/{user_id}/avatar.jpg`
- `covers/{user_id}/{experience_id}/cover.jpg`
- `photos/{user_id}/{experience_id}/{photo_id}.jpg`
- `templates/{template_id}/thumbnail.jpg`
