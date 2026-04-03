-- ================================================================
-- STEP 1: Find your user ID from Supabase Auth
-- Run this FIRST to get your user UUID:
-- ================================================================
select id, email, created_at from auth.users order by created_at desc limit 10;

-- ================================================================
-- STEP 2: Create/update your admin profile
-- Replace 'YOUR_UUID_HERE' with the id (uuid) from Step 1 above
-- ================================================================
insert into public.profiles (id, full_name, role)
values (
  'YOUR_UUID_HERE',   -- ← paste your UUID here (e.g. 'a1b2c3d4-...')
  'Pavan Jillella',
  'admin'
)
on conflict (id) do update 
  set role = 'admin',
      full_name = 'Pavan Jillella';

-- ================================================================
-- STEP 3: Verify it worked
-- ================================================================
select id, full_name, role from public.profiles;
