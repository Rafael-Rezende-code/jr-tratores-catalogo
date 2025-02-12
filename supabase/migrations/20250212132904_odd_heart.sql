/*
  # Add year and specifications columns to tractors table

  1. Changes
    - Add year column (integer)
    - Add specifications column (jsonb)
    - Update existing rows with default values
*/

-- Add new columns
ALTER TABLE tractors
ADD COLUMN IF NOT EXISTS year integer,
ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb;

-- Update existing rows with default values
UPDATE tractors
SET 
  year = 2020,
  specifications = '{
    "motor": "4 cilindros",
    "potencia": "75 cv",
    "tracao": "4x4",
    "horasDeUso": "0",
    "estado": "Novo",
    "localizacao": "Consulte"
  }'::jsonb
WHERE year IS NULL;