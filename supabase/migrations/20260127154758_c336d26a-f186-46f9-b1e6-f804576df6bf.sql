-- Create storage bucket for card images
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to card images
CREATE POLICY "Public can view card images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'card-images');

-- Allow authenticated users to upload card images (edge function uses service role)
CREATE POLICY "Service role can upload card images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'card-images');

-- Create a table to track generated cards
CREATE TABLE public.generated_cards (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  card_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow public read access (cards are game assets, not user data)
ALTER TABLE public.generated_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view generated cards"
ON public.generated_cards
FOR SELECT
USING (true);

-- Only backend can insert
CREATE POLICY "Service role can insert cards"
ON public.generated_cards
FOR INSERT
WITH CHECK (true);