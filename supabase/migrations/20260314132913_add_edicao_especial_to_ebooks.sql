/*
  # Add edicao_especial column to ebooks

  1. Changes
    - `ebooks` table: adds `edicao_especial` boolean column (default false)
      - When true, this ebook's cover image is shown as a featured banner on the homepage
      - Only one ebook should have this flag set to true at a time (enforced by application logic)

  2. Notes
    - Existing rows default to false (not a special edition)
    - No RLS changes needed; inherits existing policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ebooks' AND column_name = 'edicao_especial'
  ) THEN
    ALTER TABLE ebooks ADD COLUMN edicao_especial boolean DEFAULT false;
  END IF;
END $$;
