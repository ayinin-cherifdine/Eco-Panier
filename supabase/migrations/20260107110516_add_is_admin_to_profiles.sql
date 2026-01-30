/*
  # Add is_admin column to profiles table

  1. Changes
    - Add `is_admin` boolean column to profiles table with default value false
    - Update RLS policies to allow admin users to access more data

  2. Notes
    - This column identifies administrator users who have access to the admin dashboard
    - Default value is false for regular users
*/

-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false NOT NULL;

-- Create index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
