-- Arojen Tarinat: online multiplayer (rooms, turns, chat, audio messages).
-- Run once in the Supabase SQL editor; safe to run again.
--
-- Also needed (Dashboard): Authentication > Sign In / Providers > "Allow anonymous sign-ins" ON.
-- Players are anonymous Supabase users; nothing personal is collected besides the
-- display name they type in the lobby.
--
-- Every write goes through the security-definer functions below (or the narrow
-- insert policies on chat); row-level security lets players read only the rooms
-- they are in.

-- ---------------------------------------------------------------- tables

create table if not exists public.mp_rooms (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  host_id        uuid not null,
  status         text not null default 'lobby' check (status in ('lobby', 'playing', 'finished')),
  difficulty     text not null default 'normal' check (difficulty in ('easy', 'normal', 'hard')),
  max_players    int  not null default 4 check (max_players between 2 and 4),
  seed           int  not null,
  version        int  not null default 0,
  active_faction text,
  turn           int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- The game itself (compressed JSON), kept apart from mp_rooms so realtime
-- notifications stay small: players fetch it when the room's version changes.
create table if not exists public.mp_room_states (
  room_id    uuid primary key references public.mp_rooms (id) on delete cascade,
  version    int  not null,
  state      text not null check (length(state) <= 2000000),
  updated_at timestamptz not null default now()
);

create table if not exists public.mp_members (
  room_id   uuid not null references public.mp_rooms (id) on delete cascade,
  user_id   uuid not null,
  name      text not null check (char_length(btrim(name)) between 1 and 20),
  faction   text check (faction in ('mongol', 'song', 'rus', 'khwarezm')),
  ready     boolean not null default false,
  left_at   timestamptz,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create unique index if not exists mp_members_faction_once
  on public.mp_members (room_id, faction) where faction is not null and left_at is null;

create table if not exists public.mp_messages (
  id         bigint generated always as identity primary key,
  room_id    uuid not null references public.mp_rooms (id) on delete cascade,
  user_id    uuid not null default auth.uid(),
  kind       text not null check (kind in ('text', 'audio')),
  body       text check (body is null or char_length(body) between 1 and 300),
  audio_path text,
  audio_ms   int check (audio_ms is null or audio_ms between 300 and 30500),
  created_at timestamptz not null default now(),
  check ((kind = 'text' and body is not null and audio_path is null)
      or (kind = 'audio' and body is null and audio_path is not null and audio_ms is not null))
);
create index if not exists mp_messages_room_idx on public.mp_messages (room_id, id);

-- Reports keep a copy of the message so they survive the room's cleanup.
create table if not exists public.mp_reports (
  id            bigint generated always as identity primary key,
  room_id       uuid,
  message_id    bigint,
  reported_user uuid,
  message_kind  text,
  message_body  text,
  audio_path    text,
  reporter      uuid not null default auth.uid(),
  reason        text check (reason is null or char_length(reason) <= 200),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers

create or replace function public.mp_is_member(p_room uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from mp_members where room_id = p_room and user_id = auth.uid() and left_at is null
  );
$$;

create or replace function public.mp_touch() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists mp_rooms_touch on public.mp_rooms;
create trigger mp_rooms_touch before update on public.mp_rooms for each row execute function public.mp_touch();

-- At most 6 chat messages per player per 10 seconds.
create or replace function public.mp_message_rate() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from mp_messages
      where user_id = new.user_id and created_at > now() - interval '10 seconds') >= 6 then
    raise exception 'too_many_messages';
  end if;
  return new;
end;
$$;
drop trigger if exists mp_messages_rate on public.mp_messages;
create trigger mp_messages_rate before insert on public.mp_messages for each row execute function public.mp_message_rate();

-- ---------------------------------------------------------------- row-level security

alter table public.mp_rooms       enable row level security;
alter table public.mp_room_states enable row level security;
alter table public.mp_members     enable row level security;
alter table public.mp_messages    enable row level security;
alter table public.mp_reports     enable row level security;

drop policy if exists mp_rooms_read on public.mp_rooms;
create policy mp_rooms_read on public.mp_rooms for select to authenticated using (public.mp_is_member(id));

drop policy if exists mp_states_read on public.mp_room_states;
create policy mp_states_read on public.mp_room_states for select to authenticated using (public.mp_is_member(room_id));

drop policy if exists mp_members_read on public.mp_members;
create policy mp_members_read on public.mp_members for select to authenticated using (public.mp_is_member(room_id));

drop policy if exists mp_messages_read on public.mp_messages;
create policy mp_messages_read on public.mp_messages for select to authenticated using (public.mp_is_member(room_id));

drop policy if exists mp_messages_write on public.mp_messages;
create policy mp_messages_write on public.mp_messages for insert to authenticated with check (
  user_id = auth.uid()
  and public.mp_is_member(room_id)
  and (kind = 'text' or audio_path like room_id::text || '/' || auth.uid()::text || '/%')
);

drop policy if exists mp_reports_write on public.mp_reports;
create policy mp_reports_write on public.mp_reports for insert to authenticated with check (reporter = auth.uid());

-- ---------------------------------------------------------------- room functions

create or replace function public.mp_create_room(p_name text, p_difficulty text, p_max_players int)
returns public.mp_rooms language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_room mp_rooms;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  loop
    select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
      into v_code from generate_series(1, 6);
    exit when not exists (select 1 from mp_rooms where code = v_code);
  end loop;
  insert into mp_rooms (code, host_id, difficulty, max_players, seed)
    values (v_code, auth.uid(), p_difficulty, p_max_players, floor(random() * 2147483647)::int)
    returning * into v_room;
  insert into mp_members (room_id, user_id, name) values (v_room.id, auth.uid(), btrim(p_name));
  return v_room;
end;
$$;

create or replace function public.mp_join_room(p_code text, p_name text)
returns public.mp_rooms language plpgsql security definer set search_path = public as $$
declare
  v_room mp_rooms;
  v_member mp_members;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select * into v_room from mp_rooms where code = upper(btrim(p_code)) for update;
  if not found then raise exception 'room_not_found'; end if;
  select * into v_member from mp_members where room_id = v_room.id and user_id = auth.uid();
  if found and v_member.left_at is null then
    return v_room;
  end if;
  if v_room.status <> 'lobby' then raise exception 'room_started'; end if;
  if (select count(*) from mp_members where room_id = v_room.id and left_at is null) >= v_room.max_players then
    raise exception 'room_full';
  end if;
  insert into mp_members (room_id, user_id, name) values (v_room.id, auth.uid(), btrim(p_name))
    on conflict (room_id, user_id) do update set left_at = null, name = excluded.name, faction = null, ready = false;
  return v_room;
end;
$$;

create or replace function public.mp_choose_faction(p_room uuid, p_faction text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.mp_is_member(p_room) then raise exception 'not_member'; end if;
  if (select status from mp_rooms where id = p_room) <> 'lobby' then raise exception 'room_started'; end if;
  update mp_members set faction = p_faction, ready = false where room_id = p_room and user_id = auth.uid();
exception when unique_violation then
  raise exception 'faction_taken';
end;
$$;

create or replace function public.mp_set_ready(p_room uuid, p_ready boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.mp_is_member(p_room) then raise exception 'not_member'; end if;
  update mp_members set ready = p_ready and faction is not null
    where room_id = p_room and user_id = auth.uid();
end;
$$;

create or replace function public.mp_leave_room(p_room uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_room mp_rooms;
begin
  select * into v_room from mp_rooms where id = p_room for update;
  if not found then return; end if;
  if v_room.status = 'lobby' then
    delete from mp_members where room_id = p_room and user_id = auth.uid();
    if not exists (select 1 from mp_members where room_id = p_room) then
      delete from mp_rooms where id = p_room;
    elsif v_room.host_id = auth.uid() then
      update mp_rooms set host_id = (select user_id from mp_members where room_id = p_room order by joined_at limit 1)
        where id = p_room;
    end if;
  else
    -- In a running game the realm turns AI; the next player's phone passes the turn on.
    update mp_members set left_at = now() where room_id = p_room and user_id = auth.uid() and left_at is null;
    update mp_rooms set version = version where id = p_room;
    if not exists (select 1 from mp_members where room_id = p_room and left_at is null) then
      update mp_rooms set status = 'finished' where id = p_room;
    end if;
  end if;
end;
$$;

-- The host's phone builds the opening state (from the room's seed) and uploads it.
create or replace function public.mp_start_game(p_room uuid, p_state text, p_active_faction text, p_turn int)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_room mp_rooms;
begin
  select * into v_room from mp_rooms where id = p_room for update;
  if not found or v_room.host_id <> auth.uid() then raise exception 'not_host'; end if;
  if v_room.status <> 'lobby' then raise exception 'room_started'; end if;
  if (select count(*) from mp_members where room_id = p_room and left_at is null and faction is not null) < 2 then
    raise exception 'need_two_players';
  end if;
  if exists (select 1 from mp_members where room_id = p_room and left_at is null
             and (faction is null or (not ready and user_id <> v_room.host_id))) then
    raise exception 'not_ready';
  end if;
  insert into mp_room_states (room_id, version, state) values (p_room, 1, p_state)
    on conflict (room_id) do update set version = 1, state = excluded.state, updated_at = now();
  update mp_rooms set status = 'playing', version = 1, active_faction = p_active_faction, turn = p_turn where id = p_room;
  return 1;
end;
$$;

-- A player ends their turn: the whole game is replaced, but only by the player
-- whose turn it is (or by anyone, for a player who left or has been idle on
-- their turn for 15 minutes: the app then hands that realm to the AI), and only
-- on top of the version they started from.
create or replace function public.mp_submit_turn(
  p_room uuid, p_expected_version int, p_state text, p_active_faction text, p_turn int, p_finished boolean)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_room mp_rooms;
  v_mine text;
  v_active_present boolean;
begin
  select * into v_room from mp_rooms where id = p_room for update;
  if not found then raise exception 'room_not_found'; end if;
  if v_room.status <> 'playing' then raise exception 'not_playing'; end if;
  if v_room.version <> p_expected_version then raise exception 'stale_version'; end if;
  select faction into v_mine from mp_members where room_id = p_room and user_id = auth.uid() and left_at is null;
  if not found then raise exception 'not_member'; end if;
  select exists (select 1 from mp_members where room_id = p_room and faction = v_room.active_faction and left_at is null)
    into v_active_present;
  if v_mine is distinct from v_room.active_faction and v_active_present
     and v_room.updated_at > now() - interval '15 minutes' then
    raise exception 'not_your_turn';
  end if;
  update mp_room_states set version = v_room.version + 1, state = p_state, updated_at = now() where room_id = p_room;
  update mp_rooms set version = v_room.version + 1, active_faction = p_active_faction, turn = p_turn,
    status = case when p_finished then 'finished' else 'playing' end
    where id = p_room;
  return v_room.version + 1;
end;
$$;

-- Rooms nobody touched for two weeks (and their chat) are removed. Schedule it
-- with pg_cron, e.g.  select cron.schedule('mp-cleanup', '0 4 * * *', 'select public.mp_cleanup()');
-- Audio files of deleted rooms stay in the mp-audio bucket until removed in Storage.
create or replace function public.mp_cleanup()
returns int language sql security definer set search_path = public as $$
  with gone as (delete from mp_rooms where updated_at < now() - interval '14 days' returning 1)
  select count(*)::int from gone;
$$;

revoke all on function public.mp_create_room(text, text, int) from public, anon;
revoke all on function public.mp_join_room(text, text) from public, anon;
revoke all on function public.mp_choose_faction(uuid, text) from public, anon;
revoke all on function public.mp_set_ready(uuid, boolean) from public, anon;
revoke all on function public.mp_leave_room(uuid) from public, anon;
revoke all on function public.mp_start_game(uuid, text, text, int) from public, anon;
revoke all on function public.mp_submit_turn(uuid, int, text, text, int, boolean) from public, anon;
revoke all on function public.mp_cleanup() from public, anon, authenticated;
grant execute on function public.mp_create_room(text, text, int) to authenticated;
grant execute on function public.mp_join_room(text, text) to authenticated;
grant execute on function public.mp_choose_faction(uuid, text) to authenticated;
grant execute on function public.mp_set_ready(uuid, boolean) to authenticated;
grant execute on function public.mp_leave_room(uuid) to authenticated;
grant execute on function public.mp_start_game(uuid, text, text, int) to authenticated;
grant execute on function public.mp_submit_turn(uuid, int, text, text, int, boolean) to authenticated;

-- ---------------------------------------------------------------- realtime

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'mp_rooms') then
    alter publication supabase_realtime add table public.mp_rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'mp_members') then
    alter publication supabase_realtime add table public.mp_members;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'mp_messages') then
    alter publication supabase_realtime add table public.mp_messages;
  end if;
end;
$$;

-- ---------------------------------------------------------------- audio messages (Storage)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mp-audio', 'mp-audio', false, 1048576, array['audio/mp4', 'audio/aac', 'audio/x-m4a'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Files live at <room id>/<user id>/<random>.m4a; room members may read them,
-- and only their author may write under their own folder.
drop policy if exists mp_audio_upload on storage.objects;
create policy mp_audio_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'mp-audio'
  and (storage.foldername(name))[2] = auth.uid()::text
  and public.mp_is_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists mp_audio_read on storage.objects;
create policy mp_audio_read on storage.objects for select to authenticated using (
  bucket_id = 'mp-audio'
  and public.mp_is_member(((storage.foldername(name))[1])::uuid)
);
