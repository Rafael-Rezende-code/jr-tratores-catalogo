/*
  # Fix Storage Bucket Setup

  1. Changes
    - Recreate storage bucket with proper configuration
    - Update storage policies to ensure proper access

  2. Security
    - Public read access for images
    - Authenticated users can upload/update/delete images
    - File type restrictions for uploads
*/

-- Drop existing bucket if it exists (to ensure clean state)
DO $$
BEGIN
  DELETE FROM storage.buckets WHERE id = 'images';
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Recreate the storage bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
);

-- Drop existing policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Recreate policies with proper configuration
-- Allow public read access to all files in the images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (LOWER(RIGHT(name, 4)) IN ('.jpg', '.png', '.gif')
    OR LOWER(RIGHT(name, 5)) IN ('.jpeg', '.webp'))
);

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');