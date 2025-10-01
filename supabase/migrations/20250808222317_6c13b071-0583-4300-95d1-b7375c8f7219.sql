-- Ensure RLS is enabled and allow public read access so the Customers page can fetch data
ALTER TABLE public.cardinfo ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cardinfo' 
      AND policyname = 'Public read cardinfo'
  ) THEN
    CREATE POLICY "Public read cardinfo"
    ON public.cardinfo
    FOR SELECT
    USING (true);
  END IF;
END $$;