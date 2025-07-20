-- Create storage policies for the imagedirectory bucket

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'imagedirectory' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view images
CREATE POLICY "Allow authenticated access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'imagedirectory' AND 
  auth.role() = 'authenticated'
);

-- Allow public access to images (for viewing on the website)
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'imagedirectory'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'imagedirectory' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'imagedirectory' AND 
  auth.role() = 'authenticated'
);