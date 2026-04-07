-- Add phone and contact email to site_locations
ALTER TABLE site_locations ADD COLUMN phone TEXT;
ALTER TABLE site_locations ADD COLUMN contact_email TEXT;
