-- Create an initial admin user
-- Note: This user will need to be created manually in Supabase Auth first,
-- then we can link them to the admin_users table

-- First, let's create a function to add admin users
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  result_message text;
BEGIN
  -- Find the user by email in auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;
  
  -- If user doesn't exist, return error message
  IF target_user_id IS NULL THEN
    RETURN 'User with email ' || user_email || ' not found in auth.users';
  END IF;
  
  -- Check if user is already an admin
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = target_user_id) THEN
    RETURN 'User ' || user_email || ' is already an admin';
  END IF;
  
  -- Insert into admin_users table
  INSERT INTO public.admin_users (user_id, role, permissions)
  VALUES (target_user_id, 'admin', '["all"]'::jsonb);
  
  RETURN 'Successfully created admin user for ' || user_email;
END;
$$;

-- Example usage (commented out):
-- To create an admin user, first sign up through the auth system at /auth
-- Then run: SELECT public.create_admin_user('your-email@example.com');

-- Add a comment explaining the process
COMMENT ON FUNCTION public.create_admin_user(text) IS 
'Creates an admin user by linking an existing auth user to the admin_users table. The user must already exist in auth.users.';

-- Grant execute permission to authenticated users (admins can create other admins)
GRANT EXECUTE ON FUNCTION public.create_admin_user(text) TO authenticated;