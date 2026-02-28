-- Add icon_url to modules table (PNG icons, public URL from Supabase Storage)
ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS icon_url text;
