-- DESTRUCTIVE CHANGE: Removes the Updates feature tables.
-- This migration drops public.update_reads and public.updates.
-- Run only after deploying the app change that replaced /updates with the Community/Discord CTA page.
-- RLS policies on these tables are dropped automatically with the tables.

DROP TABLE IF EXISTS public.update_reads;
DROP TABLE IF EXISTS public.updates;
