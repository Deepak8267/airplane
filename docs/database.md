# Database

The initial schema is implemented in `supabase/migrations/202606160001_initial_schema.sql`.

## Tables

- `users`: application profile linked to `auth.users`.
- `templates`: active creator templates grouped by category.
- `experiences`: creator-owned draft or published experiences.
- `experience_pages`: ordered dynamic pages for an experience.
- `analytics`: aggregate metrics per experience.
- `events`: raw recipient interaction events.
- `payments`: Razorpay payment records.
- `subscriptions`: current user plan and subscription status.

## Important Functions

- `publish_experience(input_experience_id uuid)`: generates a unique slug, publishes the experience, and creates analytics state.
- `track_event(...)`: validates that the experience is published, inserts an event, and updates aggregate analytics.

## RLS Model

Creators can manage their own experiences and pages. Public users can read only published experiences and pages. Public users can insert tracking events but cannot read events. Creators can read analytics and events for their own experiences.
