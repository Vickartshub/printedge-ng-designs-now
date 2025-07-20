-- Make the imagedirectory bucket public for easier access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'imagedirectory';