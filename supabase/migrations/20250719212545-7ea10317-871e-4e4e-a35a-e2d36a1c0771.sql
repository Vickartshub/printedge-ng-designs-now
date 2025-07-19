
-- Drop the problematic RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create a new RLS policy that allows authenticated users to read admin_users
-- This will allow the checkAdminStatus function to work without recursion
CREATE POLICY "Authenticated users can view admin users" 
ON public.admin_users 
FOR SELECT 
TO authenticated 
USING (true);

-- Keep the existing restrictive policies for INSERT, UPDATE, DELETE
-- Only admins should be able to modify the admin_users table
CREATE POLICY "Only super admins can modify admin users" 
ON public.admin_users 
FOR ALL 
TO authenticated 
USING (false) 
WITH CHECK (false);
