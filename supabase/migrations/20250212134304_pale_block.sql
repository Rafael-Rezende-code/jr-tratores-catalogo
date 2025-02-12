/*
  # Add specifications constraints and validation

  1. Changes
    - Add NOT NULL constraint to specifications column
    - Add JSON schema validation for specifications
    - Add validation for year column
*/

-- Ensure specifications is not null and has the correct structure
ALTER TABLE tractors
ALTER COLUMN specifications SET NOT NULL,
ALTER COLUMN specifications SET DEFAULT '{
  "motor": "",
  "potencia": "",
  "tracao": "",
  "horasDeUso": "",
  "estado": "",
  "localizacao": ""
}'::jsonb;

-- Add check constraint to validate specifications structure
ALTER TABLE tractors
ADD CONSTRAINT tractors_specifications_check CHECK (
  jsonb_typeof(specifications) = 'object' AND
  specifications ? 'motor' AND
  specifications ? 'potencia' AND
  specifications ? 'tracao' AND
  specifications ? 'horasDeUso' AND
  specifications ? 'estado' AND
  specifications ? 'localizacao'
);

-- Add check constraint for year
ALTER TABLE tractors
ADD CONSTRAINT tractors_year_check CHECK (
  year >= 1900 AND year <= extract(year from current_date) + 1
);