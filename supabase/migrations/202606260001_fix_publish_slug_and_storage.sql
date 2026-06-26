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
