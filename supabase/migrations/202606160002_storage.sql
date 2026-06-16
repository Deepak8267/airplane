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
