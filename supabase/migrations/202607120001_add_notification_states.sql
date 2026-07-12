create table if not exists public.notification_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  notification_id text not null,
  read_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, notification_id)
);

create index if not exists notification_states_user_id_idx
  on public.notification_states(user_id);

drop trigger if exists notification_states_set_updated_at on public.notification_states;
create trigger notification_states_set_updated_at
before update on public.notification_states
for each row execute function public.set_updated_at();

alter table public.notification_states enable row level security;

drop policy if exists "Users manage own notification states" on public.notification_states;
create policy "Users manage own notification states" on public.notification_states
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
