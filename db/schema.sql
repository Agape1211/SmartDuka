
CREATE EXTENSION IF NOT EXISTS pgcrypto; 

CREATE TYPE role AS ENUM ('OWNER', 'EMPLOYEE');
CREATE TYPE payment_status AS ENUM ('PAID', 'CREDIT');

CREATE TABLE shops (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  tagline    TEXT NOT NULL DEFAULT 'Jua biashara yako',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID UNIQUE,
  shop_id       UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role          role NOT NULL DEFAULT 'EMPLOYEE',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_users_auth_user_id
  ON users (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id       UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  unit          TEXT NOT NULL DEFAULT 'piece',
  cost_price    NUMERIC(12,2) NOT NULL DEFAULT 0,
  sell_price    NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock         INTEGER NOT NULL DEFAULT 0,
  low_stock_at  INTEGER NOT NULL DEFAULT 5,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_shop_name ON products(shop_id, name);

CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh_key  TEXT NOT NULL,
  auth_key    TEXT NOT NULL,
  locale      TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'sw')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_push_subscriptions_shop_user ON push_subscriptions(shop_id, user_id);

CREATE TABLE low_stock_notification_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  shop_id        UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_name   TEXT NOT NULL,
  stock          INTEGER NOT NULL,
  low_stock_at   INTEGER NOT NULL,
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at   TIMESTAMPTZ
);
CREATE INDEX idx_low_stock_notification_events_pending
  ON low_stock_notification_events(occurred_at) WHERE processed_at IS NULL;
CREATE INDEX idx_low_stock_notification_events_shop_pending
  ON low_stock_notification_events(shop_id, occurred_at) WHERE processed_at IS NULL;

CREATE TABLE low_stock_notification_deliveries (
  event_id        UUID NOT NULL REFERENCES low_stock_notification_events(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  delivered_at    TIMESTAMPTZ,
  attempts        INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT,
  PRIMARY KEY (event_id, subscription_id)
);

CREATE TABLE daily_push_deliveries (
  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  reminder_date   DATE NOT NULL,
  delivered_at    TIMESTAMPTZ,
  attempts        INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT,
  PRIMARY KEY (subscription_id, reminder_date)
);
CREATE INDEX idx_daily_push_deliveries_date ON daily_push_deliveries(reminder_date);

CREATE FUNCTION enqueue_low_stock_notification() RETURNS trigger AS $$
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

CREATE TRIGGER trg_products_low_stock_notification
  AFTER INSERT OR UPDATE OF stock, low_stock_at ON products
  FOR EACH ROW EXECUTE FUNCTION enqueue_low_stock_notification();

CREATE TABLE sales (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id        UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  recorded_by_id UUID NOT NULL REFERENCES users(id),
  payment_status payment_status NOT NULL DEFAULT 'PAID',
  customer_name  TEXT,
  customer_phone TEXT,
  total          NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sales_shop_date ON sales(shop_id, created_at);

CREATE TABLE sale_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id    UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL, 
  unit_cost  NUMERIC(12,2) NOT NULL  
);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

CREATE TABLE sale_payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id        UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  recorded_by_id UUID NOT NULL REFERENCES users(id),
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sale_payments_sale ON sale_payments(sale_id);

CREATE TABLE purchases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id        UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  received_by_id UUID NOT NULL REFERENCES users(id),
  supplier       TEXT,
  total          NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_purchases_shop_date ON purchases(shop_id, created_at);

CREATE TABLE purchase_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL,
  unit_cost   NUMERIC(12,2) NOT NULL
);
CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product ON purchase_items(product_id);
