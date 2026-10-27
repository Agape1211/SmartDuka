CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh_key  TEXT NOT NULL,
  auth_key    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_shop_user
  ON push_subscriptions(shop_id, user_id);

CREATE TABLE IF NOT EXISTS low_stock_notification_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  shop_id        UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_name   TEXT NOT NULL,
  stock          INTEGER NOT NULL,
  low_stock_at   INTEGER NOT NULL,
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_low_stock_notification_events_pending
  ON low_stock_notification_events(occurred_at) WHERE processed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_low_stock_notification_events_shop_pending
  ON low_stock_notification_events(shop_id, occurred_at) WHERE processed_at IS NULL;

CREATE TABLE IF NOT EXISTS low_stock_notification_deliveries (
  event_id        UUID NOT NULL REFERENCES low_stock_notification_events(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  delivered_at    TIMESTAMPTZ,
  attempts        INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT,
  PRIMARY KEY (event_id, subscription_id)
);

CREATE TABLE IF NOT EXISTS daily_push_deliveries (
  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  reminder_date   DATE NOT NULL,
  delivered_at    TIMESTAMPTZ,
  attempts        INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT,
  PRIMARY KEY (subscription_id, reminder_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_push_deliveries_date
  ON daily_push_deliveries(reminder_date);

CREATE OR REPLACE FUNCTION enqueue_low_stock_notification() RETURNS trigger AS $$
BEGIN
  IF NEW.stock <= NEW.low_stock_at
     AND (TG_OP = 'INSERT' OR OLD.stock > OLD.low_stock_at) THEN
    INSERT INTO low_stock_notification_events
      (product_id, shop_id, product_name, stock, low_stock_at)
    VALUES
      (NEW.id, NEW.shop_id, NEW.name, NEW.stock, NEW.low_stock_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_low_stock_notification ON products;
CREATE TRIGGER trg_products_low_stock_notification
  AFTER INSERT OR UPDATE OF stock, low_stock_at ON products
  FOR EACH ROW EXECUTE FUNCTION enqueue_low_stock_notification();
