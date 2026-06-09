ALTER TABLE public.logs
  ADD COLUMN temperature numeric,
  ADD COLUMN pressure    numeric,
  ADD COLUMN weather_code smallint;
