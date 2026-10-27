ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'push_subscriptions_locale_check'
      AND conrelid = 'push_subscriptions'::regclass
  ) THEN
    ALTER TABLE push_subscriptions
      ADD CONSTRAINT push_subscriptions_locale_check CHECK (locale IN ('en', 'sw'));
  END IF;
END;
$$;
