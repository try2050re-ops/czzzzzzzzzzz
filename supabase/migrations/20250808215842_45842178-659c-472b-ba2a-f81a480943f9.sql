-- 1) Add renewal_date column to cardinfo if it doesn't exist
ALTER TABLE public.cardinfo
ADD COLUMN IF NOT EXISTS renewal_date date;

-- 2) Backfill renewal_date for existing rows using common date formats
UPDATE public.cardinfo
SET renewal_date = CASE
  WHEN charging_date IS NULL THEN NULL
  WHEN charging_date ~ '^\d{4}-\d{2}-\d{2}$' THEN (charging_date::date + INTERVAL '30 days')::date
  WHEN charging_date ~ '^\d{2}/\d{2}/\d{4}$' THEN (to_date(charging_date, 'DD/MM/YYYY') + INTERVAL '30 days')::date
  WHEN charging_date ~ '^\d{4}/\d{2}/\d{2}$' THEN (to_date(charging_date, 'YYYY/MM/DD') + INTERVAL '30 days')::date
  ELSE NULL
END
WHERE renewal_date IS NULL;

-- 3) Create (or replace) trigger function to keep renewal_date in sync with charging_date
CREATE OR REPLACE FUNCTION public.cardinfo_set_renewal_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.charging_date IS NULL THEN
    NEW.renewal_date = NULL;
  ELSE
    IF NEW.charging_date ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN
      NEW.renewal_date = (NEW.charging_date::date + INTERVAL '30 days')::date;
    ELSIF NEW.charging_date ~ '^\\d{2}/\\d{2}/\\d{4}$' THEN
      NEW.renewal_date = (to_date(NEW.charging_date, 'DD/MM/YYYY') + INTERVAL '30 days')::date;
    ELSIF NEW.charging_date ~ '^\\d{4}/\\d{2}/\\d{2}$' THEN
      NEW.renewal_date = (to_date(NEW.charging_date, 'YYYY/MM/DD') + INTERVAL '30 days')::date;
    ELSE
      NEW.renewal_date = NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4) Recreate trigger on cardinfo to use the function
DROP TRIGGER IF EXISTS trg_cardinfo_set_renewal_date ON public.cardinfo;

CREATE TRIGGER trg_cardinfo_set_renewal_date
BEFORE INSERT OR UPDATE OF charging_date ON public.cardinfo
FOR EACH ROW
EXECUTE FUNCTION public.cardinfo_set_renewal_date();