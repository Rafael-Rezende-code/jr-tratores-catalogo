/*
  # Fix specifications column

  1. Changes
    - Drop existing specifications column and constraints
    - Recreate specifications column with proper JSONB type and constraints
    - Add validation for specifications structure
*/

-- Drop existing constraints if they exist
DO $$ BEGIN
  ALTER TABLE tractors DROP CONSTRAINT IF EXISTS tractors_specifications_check;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Drop and recreate specifications column
ALTER TABLE tractors DROP COLUMN IF EXISTS specifications;
ALTER TABLE tractors ADD COLUMN specifications JSONB NOT NULL DEFAULT '{
  "motor": "",
  "potencia": "",
  "tracao": "",
  "horasDeUso": "",
  "estado": "",
  "localizacao": ""
}'::jsonb;

-- Add check constraint to validate specifications structure
ALTER TABLE tractors ADD CONSTRAINT tractors_specifications_check CHECK (
  jsonb_typeof(specifications) = 'object' AND
  specifications ? 'motor' AND
  specifications ? 'potencia' AND
  specifications ? 'tracao' AND
  specifications ? 'horasDeUso' AND
  specifications ? 'estado' AND
  specifications ? 'localizacao'
);

-- Update existing rows with default specifications
UPDATE tractors SET specifications = '{
  "motor": "",
  "potencia": "",
  "tracao": "",
  "horasDeUso": "",
  "estado": "",
  "localizacao": ""
}'::jsonb
WHERE specifications IS NULL OR specifications = '{}'::jsonb;