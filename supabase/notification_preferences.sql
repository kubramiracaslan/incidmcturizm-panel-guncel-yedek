create table if not exists public.notification_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  pref_key text not null,
  enabled boolean not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, pref_key)
);

alter table public.notification_preferences enable row level security;

create policy "notification_preferences_select_own"
  on public.notification_preferences for select to authenticated
  using (auth.uid() = user_id);

create policy "notification_preferences_insert_own"
  on public.notification_preferences for insert to authenticated
  with check (auth.uid() = user_id);

create policy "notification_preferences_update_own"
  on public.notification_preferences for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
