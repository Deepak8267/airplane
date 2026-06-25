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
