/*
  # Create storage bucket for tractor images

  1. New Storage
    - Create 'images' bucket for storing tractor images
  2. Security
    - Enable public access for viewing images
    - Allow authenticated users to upload images
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Policy for authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (LOWER(RIGHT(name, 4)) = '.jpg'
    OR LOWER(RIGHT(name, 4)) = '.png'
    OR LOWER(RIGHT(name, 5)) = '.jpeg'
    OR LOWER(RIGHT(name, 4)) = '.gif'
    OR LOWER(RIGHT(name, 5)) = '.webp')
);

-- Policy for authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Policy for authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');