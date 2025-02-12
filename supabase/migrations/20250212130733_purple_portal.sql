/*
  # Rename order column to sort_order

  1. Changes
    - Rename column `order` to `sort_order` in `tractor_gallery` table
    - Update indexes to use new column name
    - Preserve existing data and constraints

  Note: The `order` column is being renamed because it's a reserved word in SQL
*/

-- Rename the column
ALTER TABLE tractor_gallery RENAME COLUMN "order" TO sort_order;

-- Drop old index and create new one with updated name
DROP INDEX IF EXISTS idx_tractor_gallery_order;
CREATE INDEX idx_tractor_gallery_sort_order ON tractor_gallery(sort_order);

-- Rename the constraint to match new column name
ALTER TABLE tractor_gallery 
  RENAME CONSTRAINT tractor_gallery_order_check 
  TO tractor_gallery_sort_order_check;