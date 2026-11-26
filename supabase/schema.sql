begin;

create table if not exists public.umbral_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);
alter table public.umbral_profiles enable row level security;
revoke all on public.umbral_profiles from public, anon, authenticated;
grant select on public.umbral_profiles to authenticated;
drop policy if exists "Leer mi perfil" on public.umbral_profiles;
create policy "Leer mi perfil" on public.umbral_profiles for select to authenticated
using ((select auth.uid()) = id);

create or replace function public.umbral_create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.umbral_profiles (id, display_name, created_at)
  values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), 'Miembro'), 60), new.created_at)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.umbral_create_profile() from public, anon, authenticated;
drop trigger if exists umbral_after_signup on auth.users;
create trigger umbral_after_signup after insert on auth.users
for each row execute function public.umbral_create_profile();

insert into public.umbral_profiles (id, display_name, created_at)
select id, left(coalesce(nullif(trim(raw_user_meta_data->>'display_name'), ''), 'Miembro'), 60), created_at
from auth.users on conflict (id) do nothing;

create table if not exists public.umbral_guides (
  id integer primary key, title text not null, detail text not null
);
alter table public.umbral_guides enable row level security;
revoke all on public.umbral_guides from public, anon, authenticated;
grant select on public.umbral_guides to anon, authenticated;
drop policy if exists "Leer guias" on public.umbral_guides;
create policy "Leer guias" on public.umbral_guides for select to anon, authenticated using (true);
insert into public.umbral_guides values
(1, 'Al usar un equipo compartido', 'Cerrá la sesión antes de salir del navegador. Así la siguiente persona tendrá que identificarse.'),
(2, 'Al recibir un código', 'Ingresalo únicamente en el portal. Si no solicitaste el correo, podés ignorarlo.'),
(3, 'Al elegir una contraseña', 'Usá una contraseña larga y exclusiva para tu cuenta. Un gestor te puede ayudar a recordarla.')
on conflict (id) do update set title = excluded.title, detail = excluded.detail;
commit;
