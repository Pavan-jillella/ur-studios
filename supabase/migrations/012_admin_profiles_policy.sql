-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow admins to update any profile's role
CREATE POLICY "Admins can update profile roles"
ON profiles FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
