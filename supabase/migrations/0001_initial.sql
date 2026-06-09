-- Headache log schema

CREATE TABLE public.logs (
	id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	pain_level  smallint    NOT NULL CHECK (pain_level BETWEEN 0 AND 5),
	recorded_at timestamptz NOT NULL DEFAULT now(),
	latitude    numeric(10, 7),
	longitude   numeric(10, 7),
	memo        text,
	created_at  timestamptz NOT NULL DEFAULT now(),
	updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$;

CREATE TRIGGER trg_logs_updated_at
	BEFORE UPDATE ON public.logs
	FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_logs_user_recorded ON public.logs (user_id, recorded_at DESC);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs: select own"
	ON public.logs FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "logs: insert own"
	ON public.logs FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "logs: update own"
	ON public.logs FOR UPDATE
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "logs: delete own"
	ON public.logs FOR DELETE
	USING (auth.uid() = user_id);
