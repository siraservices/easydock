-- Create the marina-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('marina-photos', 'marina-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload marina photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marina-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can update their own photos
CREATE POLICY "Users can update own marina photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'marina-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can delete their own photos
CREATE POLICY "Users can delete own marina photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'marina-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can read marina photos (public bucket)
CREATE POLICY "Public read access for marina photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marina-photos');
