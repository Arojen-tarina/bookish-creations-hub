-- Arojen Tarinat: player accounts (Google or email, linked to the anonymous guest account)
-- and the cloud copy of each player's progress. Safe to run again.
--
-- Also needed (Dashboard or Management API): Authentication > "Allow manual linking" ON, so a guest
-- account can be upgraded to Google in place (same user id, same progress and matches).

create table if not exists public.player_progress (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  -- Compressed JSON: lifetime stats, unlocked achievements and saved campaigns.
  data        text not null check (length(data) <= 3000000),
  app_version text,
  level       int,
  updated_at  timestamptz not null default now()
);

alter table public.player_progress enable row level security;

drop policy if exists player_progress_own_read on public.player_progress;
create policy player_progress_own_read on public.player_progress for select to authenticated using (user_id = auth.uid());

drop policy if exists player_progress_own_insert on public.player_progress;
create policy player_progress_own_insert on public.player_progress for insert to authenticated with check (user_id = auth.uid());

drop policy if exists player_progress_own_update on public.player_progress;
create policy player_progress_own_update on public.player_progress for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists player_progress_own_delete on public.player_progress;
create policy player_progress_own_delete on public.player_progress for delete to authenticated using (user_id = auth.uid());

-- In-app account deletion (Google Play requires it for apps that let players make accounts):
-- removes the account, its cloud progress, and its chat messages and room memberships.
-- Voice files stay in the mp-audio bucket until the room cleanup removes them.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not_signed_in'; end if;
  delete from public.mp_messages where user_id = v_user;
  update public.mp_members set left_at = coalesce(left_at, now()), name = 'Player' where user_id = v_user;
  delete from public.player_progress where user_id = v_user;
  delete from auth.users where id = v_user;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
