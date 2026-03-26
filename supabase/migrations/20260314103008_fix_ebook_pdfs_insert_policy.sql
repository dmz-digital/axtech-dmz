
/*
  # Fix ebook-pdfs INSERT storage policy

  Drops and recreates the INSERT policy for ebook-pdfs bucket to ensure
  authenticated users can upload PDF files without RLS violations.
*/

DROP POLICY IF EXISTS "Authenticated users can upload ebook pdfs" ON storage.objects;

CREATE POLICY "Authenticated users can upload ebook pdfs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ebook-pdfs');
