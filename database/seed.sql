BEGIN;

INSERT INTO organizations (name, slug)
VALUES ('Acme Corporation', 'acme'),
('Masjid Albukhary', 'MAB'),
('eco-shop', 'eco')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (organization_id, sku, product_name, price)
VALUES
  (1, 'DEMO-001', 'Everyday Backpack', 39.99),
  (1, 'DEMO-002', 'Stainless Water Bottle', 14.50),
  (13, 'DEMO-003', 'Wireless Mouse', 24.99),
  (13, 'DEMO-004', 'Mechanical Keyboard', 79.00),
  (14, 'DEMO-005', 'USB-C Hub', 32.75),
  (14, 'DEMO-006', 'Laptop Stand', 45.00),
  (15, 'DEMO-007', 'Desk Lamp', 28.50),
  (15, 'DEMO-008', 'Notebook Set', 12.99),
  (16, 'DEMO-009', 'Bluetooth Speaker', 54.95),
  (17, 'DEMO-010', 'Portable Charger', 29.99)
ON CONFLICT (organization_id, sku) DO NOTHING;

INSERT INTO warehouses (organization_id, warehouse_name, warehouse_loc)
VALUES
  (1, 'Acme Central Warehouse', 'New York'),
  (13, 'Masjid Main Storage', 'Kuala Lumpur'),
  (14, 'Eco Shop Warehouse', 'Penang'),
  (15, 'North Distribution Center', 'Chicago'),
  (16, 'Eastside Stockroom', 'Boston'),
  (17, 'West Regional Warehouse', 'Seattle')
ON CONFLICT (organization_id, warehouse_name) DO NOTHING;

INSERT INTO customers (organization_id, customer_name, customer_email)
VALUES
  (1, 'Jordan Lee', 'jordan.lee@example.com'),
  (1, 'Taylor Morgan', 'taylor.morgan@example.com'),
  (13, 'Amina Rahman', 'amina.rahman@example.com'),
  (13, 'Daniel Wong', 'daniel.wong@example.com'),
  (14, 'Nur Aisyah', 'nur.aisyah@example.com'),
  (14, 'Hafiz Ismail', 'hafiz.ismail@example.com'),
  (15, 'Casey Brooks', 'casey.brooks@example.com'),
  (15, 'Riley Chen', 'riley.chen@example.com'),
  (16, 'Morgan Patel', 'morgan.patel@example.com'),
  (17, 'Jamie Rivera', 'jamie.rivera@example.com')
ON CONFLICT (organization_id, customer_email) DO NOTHING;

INSERT INTO inventory (organization_id, product_id, warehouse_id, quantity_on_hand)
VALUES
  (1, 1, 1, 10),
  (1, 2, 1, 10),
  (13, 3, 2, 10),
  (13, 4, 2, 10),
  (14, 5, 3, 10)
ON CONFLICT (warehouse_id, product_id) DO NOTHING;

INSERT INTO inventory_movements (organization_id, product_id, warehouse_id, tr_type, quantity)
VALUES
  (1, 1, 1, 'stock_in', 10),
  (1, 2, 1, 'stock_in', 10),
  (13, 3, 2, 'stock_in', 10),
  (13, 4, 2, 'stock_in', 10),
  (14, 5, 3, 'stock_in', 10);

COMMIT;