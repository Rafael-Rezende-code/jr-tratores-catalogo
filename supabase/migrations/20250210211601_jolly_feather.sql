/*
  # Initial Schema Setup for JR Tratores

  1. New Tables
    - `tractors`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with timezone)
      - `name` (text)
      - `price` (numeric)
      - `description` (text)
      - `image_url` (text)
      - `whatsapp_number` (text)
      - `is_available` (boolean)

  2. Security
    - Enable RLS on `tractors` table
    - Add policies for:
      - Public read access to available tractors
      - Authenticated users (admins) full CRUD access
*/

CREATE TABLE IF NOT EXISTS tractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  price numeric NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  whatsapp_number text NOT NULL,
  is_available boolean DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE tractors ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to available tractors
CREATE POLICY "Anyone can view available tractors"
  ON tractors
  FOR SELECT
  USING (is_available = true);

-- Policy for authenticated users (admins) to have full access
CREATE POLICY "Authenticated users have full access"
  ON tractors
  TO authenticated
  USING (true)
  WITH CHECK (true);