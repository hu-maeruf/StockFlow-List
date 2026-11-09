BEGIN;

CREATE TABLE inventory(
  inventory_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(organization_id),
  product_id INT NOT NULL REFERENCES products(product_id),
  warehouse_id INT NOT NULL REFERENCES warehouses(warehouse_id),
  quantity_on_hand INT NOT NULL CHECK (quantity_on_hand >= 0),
  quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, product_id),
  CHECK (quantity_reserved <= quantity_on_hand)
);

CREATE TABLE inventory_movements(
  inventory_mov_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(organization_id),
  product_id INT NOT NULL REFERENCES products(product_id),
  warehouse_id INT NOT NULL REFERENCES warehouses(warehouse_id),
  tr_type VARCHAR(30) NOT NULL CHECK (tr_type IN ('stock_in', 'reservation', 'reservation_release', 'adjustment', 'fulfillment', 'transfer-in', 'transfer-out')),
  quantity INT NOT NULL CHECK (quantity > 0),
  reference_id INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_org ON inventory (organization_id);

COMMIT;