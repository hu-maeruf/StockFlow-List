BEGIN;

CREATE TABLE orders(
  order_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(organization_id),
  customer_id INT NOT NULL REFERENCES customers(customer_id),
  created_by INT NOT NULL REFERENCES users(user_id),
  order_status VARCHAR(100) NOT NULL CHECK (order_status IN ('draft', 'reserved', 'confirmed', 'fulfilled', 'cancelled', 'reservation_expired')) DEFAULT 'draft',
  total DECIMAL(15, 2) NOT NULL CHECK (total > 0),
  reservation_expires_at TIMESTAMPTZ,
  idempotency_key VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key)
);

CREATE TABLE order_items(
  order_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE, 
  product_id INT NOT NULL REFERENCES products(product_id),
  warehouse_id INT NOT NULL REFERENCES warehouses(warehouse_id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(15, 2) NOT NULL CHECK (unit_price > 0)
);

COMMIT;