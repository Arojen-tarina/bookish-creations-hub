-- Arojen Tarinat: public rooms and quick match (on top of 002_multiplayer.sql). Safe to run again.

alter table public.mp_rooms add column if not exists is_public boolean not null default false;

-- Public rooms are listed only while someone is around: joining touches the room.
drop function if exists public.mp_create_room(text, text, int);

create or replace function public.mp_create_room(p_name text, p_difficulty text, p_max_players int, p_public boolean default false)
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
  insert into mp_rooms (code, host_id, difficulty, max_players, seed, is_public)
    values (v_code, auth.uid(), p_difficulty, p_max_players, floor(random() * 2147483647)::int, coalesce(p_public, false))
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
  update mp_rooms set version = version where id = v_room.id returning * into v_room;
  return v_room;
end;
$$;

-- Open public games: still in the lobby, not full, active in the last 30 minutes.
create or replace function public.mp_list_public_rooms()
returns table (code text, host_name text, players int, max_players int, difficulty text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.code,
         (select m.name from mp_members m where m.room_id = r.id and m.user_id = r.host_id),
         (select count(*)::int from mp_members m where m.room_id = r.id and m.left_at is null),
         r.max_players, r.difficulty, r.created_at
  from mp_rooms r
  where r.is_public and r.status = 'lobby' and r.updated_at > now() - interval '30 minutes'
    and (select count(*) from mp_members m where m.room_id = r.id and m.left_at is null) < r.max_players
  order by r.created_at desc
  limit 30;
$$;

-- Joins the oldest open public game, or opens a new one (Normal, up to 4 players) for others to join.
create or replace function public.mp_quick_match(p_name text)
returns public.mp_rooms language plpgsql security definer set search_path = public as $$
declare
  v_code text;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select r.code into v_code from mp_rooms r
   where r.is_public and r.status = 'lobby' and r.updated_at > now() - interval '30 minutes'
     and not exists (select 1 from mp_members m where m.room_id = r.id and m.user_id = auth.uid() and m.left_at is null)
     and (select count(*) from mp_members m where m.room_id = r.id and m.left_at is null) < r.max_players
   order by r.created_at
   limit 1;
  if v_code is not null then
    return public.mp_join_room(v_code, p_name);
  end if;
  return public.mp_create_room(p_name, 'normal', 4, true);
end;
$$;

revoke all on function public.mp_create_room(text, text, int, boolean) from public, anon;
revoke all on function public.mp_join_room(text, text) from public, anon;
revoke all on function public.mp_list_public_rooms() from public, anon;
revoke all on function public.mp_quick_match(text) from public, anon;
grant execute on function public.mp_create_room(text, text, int, boolean) to authenticated;
grant execute on function public.mp_join_room(text, text) to authenticated;
grant execute on function public.mp_list_public_rooms() to authenticated;
grant execute on function public.mp_quick_match(text) to authenticated;
