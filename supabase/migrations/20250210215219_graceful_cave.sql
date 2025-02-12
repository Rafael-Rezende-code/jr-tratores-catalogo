/*
  # Final Storage Bucket Fix

  1. Changes
    - Ensure storage schema exists
    - Create storage bucket with proper configuration
    - Set up all necessary policies
    - Handle edge cases and errors

  2. Security
    - Public read access for images
    - Authenticated users can upload/update/delete images
    - Proper file type and size restrictions
*/

-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create storage.buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    owner uuid,
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create storage.objects table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
    CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);

-- Ensure the bucket is created with proper configuration
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
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Recreate all policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (LOWER(RIGHT(name, 4)) IN ('.jpg', '.png', '.gif')
    OR LOWER(RIGHT(name, 5)) IN ('.jpeg', '.webp'))
);

CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON SCHEMA storage TO postgres, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO postgres, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO postgres, authenticated, service_role;