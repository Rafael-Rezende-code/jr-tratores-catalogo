/*
  # Gallery System Update

  1. Changes
    - Drop and recreate tractor_gallery table with proper constraints
    - Add RLS policies for gallery management
    - Add indexes for better performance

  2. Security
    - Enable RLS on tractor_gallery table
    - Add policies for public viewing and admin management
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS tractor_gallery;

-- Create gallery table with proper structure
CREATE TABLE tractor_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tractor_id uuid NOT NULL REFERENCES tractors(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT tractor_gallery_order_check CHECK ("order" >= 0)
);

-- Create index for faster lookups
CREATE INDEX idx_tractor_gallery_tractor_id ON tractor_gallery(tractor_id);
CREATE INDEX idx_tractor_gallery_order ON tractor_gallery("order");

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