/*
  # Create tractor gallery table

  1. New Tables
    - `tractor_gallery`
      - `id` (uuid, primary key)
      - `tractor_id` (uuid, foreign key to tractors)
      - `image_url` (text)
      - `order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `tractor_gallery` table
    - Add policy for public read access
    - Add policy for authenticated users to manage gallery

  3. Indexes
    - Create index on tractor_id for faster lookups
    - Create index on order for sorted queries
*/

-- Create gallery table with proper structure
CREATE TABLE IF NOT EXISTS tractor_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tractor_id uuid NOT NULL REFERENCES tractors(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT tractor_gallery_order_check CHECK ("order" >= 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tractor_gallery_tractor_id ON tractor_gallery(tractor_id);
CREATE INDEX IF NOT EXISTS idx_tractor_gallery_order ON tractor_gallery("order");

-- Enable RLS
ALTER TABLE tractor_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view gallery images"
  ON tractor_gallery
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tractors
      WHERE tractors.id = tractor_gallery.tractor_id
      AND tractors.is_available = true
    )
  );

CREATE POLICY "Authenticated users can manage gallery"
  ON tractor_gallery
  TO authenticated
  USING (true)
  WITH CHECK (true);