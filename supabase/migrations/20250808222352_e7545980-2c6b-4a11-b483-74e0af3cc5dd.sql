-- Ensure anon/authenticated roles can read from public.cardinfo via PostgREST
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.cardinfo TO anon, authenticated;