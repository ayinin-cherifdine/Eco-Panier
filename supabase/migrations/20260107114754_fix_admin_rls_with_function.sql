/*
  # Fix Admin RLS Policies with Helper Function

  ## Overview
  This migration fixes potential RLS recursion issues by creating a helper function
  to check if the current user is an admin, then uses this function in RLS policies.

  ## Changes
  
  1. Create helper function `is_current_user_admin()`
  2. Drop and recreate admin policies using the helper function
  
  ## Security Notes
  - Helper function is SECURITY DEFINER to bypass RLS for the admin check
  - This prevents circular RLS evaluation issues
*/

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT COALESCE(is_admin, false) OR user_type = 'admin'
  INTO is_admin_user
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(is_admin_user, false);
END;
$$;

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());
