-- Create trigger to automatically create a public.users profile when a new auth.users row is inserted
-- This avoids client-side race conditions that can violate the FK (users.id -> auth.users.id)

-- Function: public.handle_new_user()
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    'student'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger: on_auth_user_created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


