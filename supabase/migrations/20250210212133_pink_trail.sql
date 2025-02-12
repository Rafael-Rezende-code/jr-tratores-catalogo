/*
  # Create tractors table

  1. New Tables
    - `tractors`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `name` (text)
      - `price` (numeric)
      - `description` (text)
      - `image_url` (text)
      - `whatsapp_number` (text)
      - `is_available` (boolean)

  2. Security
    - Enable RLS on `tractors` table
    - Add policy for public read access to available tractors
    - Add policy for authenticated users to have full access
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

-- Insert some sample data
INSERT INTO tractors (name, price, description, image_url, whatsapp_number, is_available)
VALUES 
  (
    'Trator John Deere 5075E', 
    250000, 
    'Trator agrícola com 75cv, tração 4x4, ideal para pequenas e médias propriedades.',
    'https://images.unsplash.com/photo-1605338803155-8b46c2edc992?w=800',
    '5511999999999',
    true
  ),
  (
    'Trator Massey Ferguson 4707', 
    320000, 
    'Trator robusto com 75cv, perfeito para trabalhos pesados no campo.',
    'https://images.unsplash.com/photo-1599574444037-c9f8c399b22c?w=800',
    '5511999999999',
    true
  );