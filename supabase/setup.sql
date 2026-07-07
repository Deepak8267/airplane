-- AIRPLANE consolidated Supabase setup
-- Run this file in Supabase SQL editor for a fresh project.
-- It includes schema, storage, policies, functions, and seed templates.


-- ============================================================
-- supabase/migrations/202606160001_initial_schema.sql
-- ============================================================
create extension if not exists "pgcrypto";

create type public.template_category as enum ('love', 'birthday', 'friends', 'family', 'fun');
create type public.template_type as enum (
  'date_proposal',
  'marriage_proposal',
  'birthday_surprise',
  'birthday_memory_book',
  'friendship_quiz',
  'best_friend_challenge',
  'family_memories',
  'mystery_reveal'
);
create type public.experience_status as enum ('draft', 'published', 'archived');
create type public.experience_page_type as enum ('cover', 'memory', 'quiz', 'countdown', 'proposal', 'final');
create type public.event_type as enum (
  'experience_viewed',
  'page_viewed',
  'button_clicked',
  'quiz_answered',
  'proposal_no_attempted',
  'proposal_answered_yes',
  'proposal_answered_no',
  'experience_completed'
);
create type public.user_plan as enum ('free', 'pro');
create type public.subscription_status as enum ('active', 'inactive', 'cancelled', 'past_due');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category public.template_category not null,
  description text not null,
  thumbnail_url text,
  is_premium boolean not null default false,
  template_type public.template_type not null,
  default_theme jsonb not null,
  default_pages jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  template_id uuid not null references public.templates(id),
  title text not null default '',
  recipient_name text not null default '',
  message text not null default '',
  theme jsonb not null,
  cover_photo_url text,
  slug text unique,
  status public.experience_status not null default 'draft',
  is_published boolean not null default false,
  published_at timestamptz,
  watermark_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_requires_slug check ((is_published = false) or (slug is not null))
);

create table public.experience_pages (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  page_type public.experience_page_type not null,
  position integer not null,
  title text not null default '',
  content jsonb not null default '{}'::jsonb,
  media_urls text[] not null default '{}',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (experience_id, position)
);

create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null unique references public.experiences(id) on delete cascade,
  views integer not null default 0,
  unique_visitors integer not null default 0,
  completions integer not null default 0,
  average_completion_time_seconds numeric not null default 0,
  total_no_attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  visitor_id text not null,
  session_id text not null,
  event_type public.event_type not null,
  page_id uuid references public.experience_pages(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_signature text,
  amount integer not null,
  currency text not null default 'INR',
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  plan public.user_plan not null default 'free',
  status public.subscription_status not null default 'inactive',
  razorpay_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index experiences_user_id_idx on public.experiences(user_id);
create index experiences_slug_idx on public.experiences(slug) where slug is not null;
create index experience_pages_experience_id_position_idx on public.experience_pages(experience_id, position);
create index events_experience_id_created_at_idx on public.events(experience_id, created_at desc);
create index events_unique_visitor_idx on public.events(experience_id, visitor_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger templates_set_updated_at before update on public.templates for each row execute function public.set_updated_at();
create trigger experiences_set_updated_at before update on public.experiences for each row execute function public.set_updated_at();
create trigger experience_pages_set_updated_at before update on public.experience_pages for each row execute function public.set_updated_at();
create trigger analytics_set_updated_at before update on public.analytics for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.app_metadata->>'provider'
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.generate_experience_slug()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := upper(substr(encode(gen_random_bytes(5), 'base64'), 1, 6));
    candidate := replace(replace(candidate, '/', 'X'), '+', 'Y');
    exit when not exists (select 1 from public.experiences where slug = candidate);
  end loop;

  return candidate;
end;
$$;

create or replace function public.publish_experience(input_experience_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_slug text;
begin
  if not exists (
    select 1 from public.experiences
    where id = input_experience_id and user_id = auth.uid()
  ) then
    raise exception 'Experience not found';
  end if;

  select coalesce(slug, public.generate_experience_slug())
  into generated_slug
  from public.experiences
  where id = input_experience_id;

  update public.experiences
  set slug = generated_slug,
      status = 'published',
      is_published = true,
      published_at = coalesce(published_at, now())
  where id = input_experience_id;

  insert into public.analytics (experience_id)
  values (input_experience_id)
  on conflict (experience_id) do nothing;

  return generated_slug;
end;
$$;

create or replace function public.track_event(
  input_experience_id uuid,
  input_visitor_id text,
  input_session_id text,
  input_event_type public.event_type,
  input_page_id uuid default null,
  input_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  completion_time numeric;
begin
  if not exists (
    select 1 from public.experiences
    where id = input_experience_id and is_published = true
  ) then
    raise exception 'Published experience not found';
  end if;

  insert into public.events (experience_id, visitor_id, session_id, event_type, page_id, metadata)
  values (input_experience_id, input_visitor_id, input_session_id, input_event_type, input_page_id, input_metadata);

  insert into public.analytics (experience_id)
  values (input_experience_id)
  on conflict (experience_id) do nothing;

  if input_event_type = 'experience_viewed' then
    update public.analytics
    set views = views + 1,
        unique_visitors = (
          select count(distinct visitor_id)
          from public.events
          where experience_id = input_experience_id
        )
    where experience_id = input_experience_id;
  elsif input_event_type = 'experience_completed' then
    completion_time := coalesce((input_metadata->>'completionTimeSeconds')::numeric, 0);

    update public.analytics
    set completions = completions + 1,
        average_completion_time_seconds =
          ((average_completion_time_seconds * completions) + completion_time) / greatest(completions + 1, 1)
    where experience_id = input_experience_id;
  elsif input_event_type = 'proposal_no_attempted' then
    update public.analytics
    set total_no_attempts = total_no_attempts + 1
    where experience_id = input_experience_id;
  end if;
end;
$$;

alter table public.users enable row level security;
alter table public.templates enable row level security;
alter table public.experiences enable row level security;
alter table public.experience_pages enable row level security;
alter table public.analytics enable row level security;
alter table public.events enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can read own profile" on public.users for select using (id = auth.uid());
create policy "Users can update own profile" on public.users for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Active templates are public" on public.templates for select using (is_active = true);

create policy "Creators manage own experiences" on public.experiences for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy "Published experiences are public" on public.experiences for select
using (is_published = true and status = 'published');

create policy "Creators manage own pages" on public.experience_pages for all
using (exists (select 1 from public.experiences e where e.id = experience_id and e.user_id = auth.uid()))
with check (exists (select 1 from public.experiences e where e.id = experience_id and e.user_id = auth.uid()));
create policy "Published pages are public" on public.experience_pages for select
using (exists (select 1 from public.experiences e where e.id = experience_id and e.is_published = true));

create policy "Creators read own analytics" on public.analytics for select
using (exists (select 1 from public.experiences e where e.id = experience_id and e.user_id = auth.uid()));

create policy "Public can insert events" on public.events for insert with check (true);
create policy "Creators read own events" on public.events for select
using (exists (select 1 from public.experiences e where e.id = experience_id and e.user_id = auth.uid()));

create policy "Users read own payments" on public.payments for select using (user_id = auth.uid());
create policy "Users read own subscriptions" on public.subscriptions for select using (user_id = auth.uid());


-- ============================================================
-- supabase/migrations/202606160002_storage.sql
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('covers', 'covers', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('photos', 'photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('templates', 'templates', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Public reads public assets" on storage.objects
for select using (bucket_id in ('avatars', 'covers', 'photos', 'templates'));

create policy "Users upload own avatars" on storage.objects
for insert with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own avatars" on storage.objects
for update using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users upload own experience media" on storage.objects
for insert with check (
  bucket_id in ('covers', 'photos')
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own experience media" on storage.objects
for update using (
  bucket_id in ('covers', 'photos')
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete own media" on storage.objects
for delete using (
  bucket_id in ('avatars', 'covers', 'photos')
  and auth.uid()::text = (storage.foldername(name))[1]
);


-- ============================================================
-- supabase/migrations/202606180001_fix_auth_user_trigger.sql
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.app_metadata->>'provider', 'email')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.users.full_name, excluded.full_name),
    avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url),
    provider = coalesce(public.users.provider, excluded.provider);

  begin
    insert into public.subscriptions (user_id, plan, status)
    values (new.id, 'free', 'active')
    on conflict (user_id) do nothing;
  exception
    when undefined_table or undefined_object or invalid_text_representation then
      null;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- ============================================================
-- supabase/migrations/202606180002_harden_signup_profile_bootstrap.sql
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into public.users (id, email, full_name, avatar_url, provider)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
      new.raw_user_meta_data->>'avatar_url',
      coalesce(new.app_metadata->>'provider', 'email')
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(public.users.full_name, excluded.full_name),
      avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url),
      provider = coalesce(public.users.provider, excluded.provider);

    insert into public.subscriptions (user_id, plan, status)
    values (new.id, 'free', 'active')
    on conflict (user_id) do nothing;
  exception
    when others then
      raise warning 'AIRPLANE profile bootstrap skipped for auth user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "Users can insert own profile" on public.users;

create policy "Users can insert own profile" on public.users
for insert
with check (id = auth.uid());


-- ============================================================
-- supabase/migrations/202606250001_harden_track_event_analytics.sql
-- ============================================================
create or replace function public.track_event(
  input_experience_id uuid,
  input_visitor_id text,
  input_session_id text,
  input_event_type public.event_type,
  input_page_id uuid default null,
  input_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  completion_already_recorded boolean;
  completion_time numeric;
begin
  if not exists (
    select 1 from public.experiences
    where id = input_experience_id and is_published = true
  ) then
    raise exception 'Published experience not found';
  end if;

  completion_already_recorded := input_event_type = 'experience_completed'
    and exists (
      select 1
      from public.events
      where experience_id = input_experience_id
        and session_id = input_session_id
        and event_type = 'experience_completed'
    );

  insert into public.events (experience_id, visitor_id, session_id, event_type, page_id, metadata)
  values (input_experience_id, input_visitor_id, input_session_id, input_event_type, input_page_id, input_metadata);

  insert into public.analytics (experience_id)
  values (input_experience_id)
  on conflict (experience_id) do nothing;

  if input_event_type = 'experience_viewed' then
    update public.analytics
    set views = views + 1,
        unique_visitors = (
          select count(distinct visitor_id)
          from public.events
          where experience_id = input_experience_id
        )
    where experience_id = input_experience_id;
  elsif input_event_type = 'experience_completed' and not completion_already_recorded then
    completion_time := case
      when coalesce(input_metadata->>'completionTimeSeconds', '') ~ '^[0-9]+(\.[0-9]+)?$'
      then (input_metadata->>'completionTimeSeconds')::numeric
      else 0
    end;

    update public.analytics
    set completions = completions + 1,
        average_completion_time_seconds =
          ((average_completion_time_seconds * completions) + completion_time) / greatest(completions + 1, 1)
    where experience_id = input_experience_id;
  elsif input_event_type = 'proposal_no_attempted' then
    update public.analytics
    set total_no_attempts = total_no_attempts + 1
    where experience_id = input_experience_id;
  end if;
end;
$$;


-- ============================================================
-- supabase/migrations/202606260001_fix_publish_slug_and_storage.sql
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('covers', 'covers', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('photos', 'photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('templates', 'templates', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads public assets" on storage.objects;
drop policy if exists "Users upload own avatars" on storage.objects;
drop policy if exists "Users update own avatars" on storage.objects;
drop policy if exists "Users upload own experience media" on storage.objects;
drop policy if exists "Users update own experience media" on storage.objects;
drop policy if exists "Users delete own media" on storage.objects;

create policy "Public reads public assets" on storage.objects
for select using (bucket_id in ('avatars', 'covers', 'photos', 'templates'));

create policy "Users upload own avatars" on storage.objects
for insert with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own avatars" on storage.objects
for update using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users upload own experience media" on storage.objects
for insert with check (
  bucket_id in ('covers', 'photos')
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own experience media" on storage.objects
for update using (
  bucket_id in ('covers', 'photos')
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id in ('covers', 'photos')
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete own media" on storage.objects
for delete using (
  bucket_id in ('avatars', 'covers', 'photos')
  and auth.uid()::text = (storage.foldername(name))[1]
);

create or replace function public.generate_experience_slug()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  index_value integer;
begin
  loop
    candidate := '';

    for index_value in 1..6 loop
      candidate := candidate || substr(alphabet, floor(random() * length(alphabet) + 1)::integer, 1);
    end loop;

    exit when not exists (select 1 from public.experiences where slug = candidate);
  end loop;

  return candidate;
end;
$$;

create or replace function public.publish_experience(input_experience_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_slug text;
begin
  if not exists (
    select 1 from public.experiences
    where id = input_experience_id and user_id = auth.uid()
  ) then
    raise exception 'Experience not found';
  end if;

  select coalesce(slug, public.generate_experience_slug())
  into generated_slug
  from public.experiences
  where id = input_experience_id;

  update public.experiences
  set slug = generated_slug,
      status = 'published',
      is_published = true,
      published_at = coalesce(published_at, now())
  where id = input_experience_id;

  insert into public.analytics (experience_id)
  values (input_experience_id)
  on conflict (experience_id) do nothing;

  return generated_slug;
end;
$$;


-- ============================================================
-- supabase/seed.sql
-- ============================================================
insert into public.templates (
  name,
  slug,
  category,
  description,
  is_premium,
  template_type,
  default_theme,
  default_pages
) values
  (
    'Date Proposal',
    'date-proposal',
    'love',
    'A warm, playful invite for a special date.',
    false,
    'date_proposal',
    '{"id":"rose","name":"Rose","background":"#fff7f5","foreground":"#2f1b1b","accent":"#e85d75","muted":"#f7d8dc","fontFamily":"serif"}',
    '[{"pageType":"cover","title":"A little question","content":{"body":"I made something for you."},"mediaUrls":[],"settings":{}},{"pageType":"proposal","title":"Will you go on a date with me?","content":{"question":"Will you go on a date with me?"},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"Can''t wait","content":{"finalMessage":"This is going to be lovely."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Marriage Proposal',
    'marriage-proposal',
    'love',
    'A proposal flow with a moving NO button and full analytics.',
    true,
    'marriage_proposal',
    '{"id":"champagne","name":"Champagne","background":"#fffaf0","foreground":"#2b2118","accent":"#c9973f","muted":"#f0dfb8","fontFamily":"serif"}',
    '[{"pageType":"cover","title":"For us","content":{"body":"Every memory brought me here."},"mediaUrls":[],"settings":{}},{"pageType":"memory","title":"My favorite memory","content":{"body":"Add the moment that says everything."},"mediaUrls":[],"settings":{}},{"pageType":"proposal","title":"Will You Marry Me?","content":{"question":"Will You Marry Me?"},"mediaUrls":[],"settings":{"moveNoButton":true}},{"pageType":"final","title":"Forever starts here","content":{"finalMessage":"You said yes."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Birthday Surprise',
    'birthday-surprise',
    'birthday',
    'A bright reveal for birthday wishes.',
    false,
    'birthday_surprise',
    '{"id":"confetti","name":"Confetti","background":"#f9fbff","foreground":"#182033","accent":"#ff7a59","muted":"#dbeafe","fontFamily":"rounded"}',
    '[{"pageType":"cover","title":"Happy birthday","content":{"body":"Tap through your surprise."},"mediaUrls":[],"settings":{}},{"pageType":"countdown","title":"Ready?","content":{"targetDate":""},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"You are celebrated","content":{"finalMessage":"Hope this day feels as special as you are."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Birthday Memory Book',
    'birthday-memory-book',
    'birthday',
    'A page-by-page collection of favorite birthday memories.',
    true,
    'birthday_memory_book',
    '{"id":"sunrise","name":"Sunrise","background":"#fffdf7","foreground":"#262626","accent":"#f97316","muted":"#fde68a","fontFamily":"sans"}',
    '[{"pageType":"cover","title":"Your memory book","content":{"body":"A few moments worth keeping."},"mediaUrls":[],"settings":{}},{"pageType":"memory","title":"Memory one","content":{"body":"Add a favorite photo and note."},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"More to come","content":{"finalMessage":"The best memories are still ahead."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Friendship Quiz',
    'friendship-quiz',
    'friends',
    'A light quiz to see how well your friend knows you.',
    false,
    'friendship_quiz',
    '{"id":"mint","name":"Mint","background":"#f4fff8","foreground":"#10231b","accent":"#10b981","muted":"#bbf7d0","fontFamily":"rounded"}',
    '[{"pageType":"cover","title":"Friendship check","content":{"body":"Let''s see how well you know me."},"mediaUrls":[],"settings":{}},{"pageType":"quiz","title":"First question","content":{"question":"What is my go-to comfort food?","answers":[{"id":"a","label":"Pizza"},{"id":"b","label":"Noodles"},{"id":"c","label":"Ice cream"}]},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"You made it","content":{"finalMessage":"Certified friend energy."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Best Friend Challenge',
    'best-friend-challenge',
    'friends',
    'A competitive best friend quiz flow.',
    true,
    'best_friend_challenge',
    '{"id":"electric","name":"Electric","background":"#f8fafc","foreground":"#111827","accent":"#2563eb","muted":"#bfdbfe","fontFamily":"sans"}',
    '[{"pageType":"cover","title":"Best friend challenge","content":{"body":"Your score awaits."},"mediaUrls":[],"settings":{}},{"pageType":"quiz","title":"Challenge round","content":{"question":"Which plan would I choose?","answers":[{"id":"a","label":"Movie night"},{"id":"b","label":"Road trip"},{"id":"c","label":"Cafe hopping"}]},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"Result unlocked","content":{"finalMessage":"Best friend status: strong."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Family Memories',
    'family-memories',
    'family',
    'A simple family memory timeline.',
    false,
    'family_memories',
    '{"id":"garden","name":"Garden","background":"#fbfff5","foreground":"#1f2a1f","accent":"#65a30d","muted":"#d9f99d","fontFamily":"serif"}',
    '[{"pageType":"cover","title":"Family memories","content":{"body":"A few memories from the people who matter."},"mediaUrls":[],"settings":{}},{"pageType":"memory","title":"A day to remember","content":{"body":"Add your favorite family note."},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"Always home","content":{"finalMessage":"Thank you for everything."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Mystery Reveal',
    'mystery-reveal',
    'fun',
    'A suspenseful reveal with timed pages.',
    false,
    'mystery_reveal',
    '{"id":"midnight","name":"Midnight","background":"#111827","foreground":"#f9fafb","accent":"#22d3ee","muted":"#334155","fontFamily":"sans"}',
    '[{"pageType":"cover","title":"Something is waiting","content":{"body":"Open each clue."},"mediaUrls":[],"settings":{}},{"pageType":"countdown","title":"Almost there","content":{"targetDate":""},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"Surprise","content":{"finalMessage":"The reveal is yours to customize."},"mediaUrls":[],"settings":{}}]'
  )
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  is_premium = excluded.is_premium,
  template_type = excluded.template_type,
  default_theme = excluded.default_theme,
  default_pages = excluded.default_pages,
  updated_at = now();

