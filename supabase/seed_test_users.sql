-- Seed Test Users for UR Studios
-- Run this AFTER creating users via Supabase Dashboard or Auth API
-- This script updates their profiles to set roles

-- ============================================
-- OPTION 1: Create users via Supabase Dashboard
-- ============================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Create these users:
--
--    ADMIN:
--    Email: admin@urstudios.com
--    Password: Admin123!
--
--    CLIENT:
--    Email: client@urstudios.com
--    Password: Client123!
--
-- 4. Then run the SQL below to set their roles

-- ============================================
-- OPTION 2: Use Supabase Auth Admin API
-- ============================================
-- If you have service_role key, you can use the Admin API
-- See: https://supabase.com/docs/reference/javascript/auth-admin-createuser

-- ============================================
-- Set roles for created users (run after creating users)
-- ============================================

-- Update admin user role
update public.profiles
set role = 'admin', full_name = 'Admin User'
where id = (
  select id from auth.users where email = 'admin@urstudios.com'
);

-- Update client user role (should already be 'client' by default)
update public.profiles
set role = 'client', full_name = 'Test Client'
where id = (
  select id from auth.users where email = 'client@urstudios.com'
);

-- Verify the users
select 
  p.id,
  u.email,
  p.full_name,
  p.role,
  p.created_at
from public.profiles p
join auth.users u on u.id = p.id
where u.email in ('admin@urstudios.com', 'client@urstudios.com');
