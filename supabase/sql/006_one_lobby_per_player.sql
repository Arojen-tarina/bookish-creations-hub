-- Arojen Tarinat: a player waits in one lobby at a time (on top of 004_public_rooms.sql). Safe to run again.
--
-- The app follows one room at a time. Before this, a player who went back from a lobby
-- and pressed Quick match or Create again stayed in the old lobby too, and that empty
-- room kept showing in the public games list. Creating or joining a room now leaves the
-- player's other rooms that have not started; games already running are not touched.

create or replace function public.mp_leave_other_lobbies(p_keep uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_room uuid;
begin
  for v_room in
    select m.room_id from mp_members m join mp_rooms r on r.id = m.room_id
     where m.user_id = auth.uid() and m.left_at is null and r.status = 'lobby'
       and (p_keep is null or m.room_id <> p_keep)
  loop
    perform public.mp_leave_room(v_room);
  end loop;
end;
$$;

create or replace function public.mp_create_room(p_name text, p_difficulty text, p_max_players int, p_public boolean default false)
returns public.mp_rooms language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_room mp_rooms;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  perform public.mp_leave_other_lobbies(null);
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
  -- The join is going ahead: other lobbies this player still sits in are left first.
  perform public.mp_leave_other_lobbies(v_room.id);
  insert into mp_members (room_id, user_id, name) values (v_room.id, auth.uid(), btrim(p_name))
    on conflict (room_id, user_id) do update set left_at = null, name = excluded.name, faction = null, ready = false;
  update mp_rooms set version = version where id = v_room.id returning * into v_room;
  return v_room;
end;
$$;

revoke all on function public.mp_leave_other_lobbies(uuid) from public, anon, authenticated;
revoke all on function public.mp_create_room(text, text, int, boolean) from public, anon;
revoke all on function public.mp_join_room(text, text) from public, anon;
grant execute on function public.mp_create_room(text, text, int, boolean) to authenticated;
grant execute on function public.mp_join_room(text, text) to authenticated;
