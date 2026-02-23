
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert cards" ON public.generated_cards;

-- Recreate with proper restriction: only service role can insert
-- Since service_role bypasses RLS entirely, we deny all inserts via RLS
-- This means only service_role (used by edge functions) can insert
CREATE POLICY "Deny public inserts" 
ON public.generated_cards 
FOR INSERT 
WITH CHECK (false);
