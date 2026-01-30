/*
  # Add Admin RLS Policies

  ## Overview
  This migration adds Row Level Security policies to allow admin users
  to view and manage all data in the system.

  ## Changes
  
  ### Profiles Table
  - Add policy for admins to view all profiles
  
  ### Orders Table
  - Add policy for admins to view all orders
  - Add policy for admins to update all orders (for status management)
  
  ## Security Notes
  - Policies check both is_admin and user_type fields for redundancy
  - Admin access is read-only for profiles, read-write for orders
*/

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.user_type = 'admin')
    )
  );

-- Add policy for admins to view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.user_type = 'admin')
    )
  );

-- Add policy for admins to update all orders (for status management)
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.user_type = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.user_type = 'admin')
    )
  );
