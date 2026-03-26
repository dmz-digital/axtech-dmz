
/*
  # Fix ebook storage RLS policies

  The existing INSERT policies for ebook-covers and ebook-pdfs buckets are missing
  the TO authenticated clause, causing uploads to be rejected even for logged-in users.

  This migration drops and recreates the INSERT (and other) policies with the correct
  role restriction so that authenticated admins can upload files.
*/

DROP POLICY IF EXISTS "Authenticated users can upload ebook covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook pdfs" ON storage.objects;

CREATE POLICY "Authenticated users can upload ebook covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ebook-covers');

CREATE POLICY "Authenticated users can update ebook covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'ebook-covers');

CREATE POLICY "Authenticated users can delete ebook covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ebook-covers');

CREATE POLICY "Authenticated users can upload ebook pdfs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ebook-pdfs');

CREATE POLICY "Authenticated users can update ebook pdfs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'ebook-pdfs');

CREATE POLICY "Authenticated users can delete ebook pdfs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ebook-pdfs');
