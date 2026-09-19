-- Removes the knowledge base used only by the now-removed moose-chat
-- Edge Function (Lovable AI Gateway integration). The Moose assistant is
-- local-only (mooseFaq.ts) now, so this table is no longer needed.
DROP TABLE IF EXISTS public.moose_knowledge;
