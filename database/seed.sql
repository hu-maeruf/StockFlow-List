BEGIN;

INSERT INTO products (organization_id, sku, product_name, price)
VALUES
  (1, 'DEMO-001', 'Everyday Backpack', 39.99),
  (1, 'DEMO-002', 'Stainless Water Bottle', 14.50),
  (1, 'DEMO-003', 'Wireless Mouse', 24.99),
  (4, 'DEMO-004', 'Mechanical Keyboard', 79.00),
  (4, 'DEMO-005', 'USB-C Hub', 32.75),
  (4, 'DEMO-006', 'Laptop Stand', 45.00),
  (4, 'DEMO-007', 'Desk Lamp', 28.50),
  (5, 'DEMO-008', 'Notebook Set', 12.99),
  (5, 'DEMO-009', 'Bluetooth Speaker', 54.95),
  (5, 'DEMO-010', 'Portable Charger', 29.99)
ON CONFLICT (organization_id, sku) DO NOTHING;

INSERT INTO warehouses (organization_id, warehouse_name, warehouse_loc)
VALUES
  (1, 'Acme Central Warehouse', 'New York'),
  (1, 'Masjid Main Storage', 'Kuala Lumpur'),
  (4, 'Eco Shop Warehouse', 'Penang'),
  (4, 'North Distribution Center', 'Chicago'),
  (4, 'Eastside Stockroom', 'Boston'),
  (5, 'West Regional Warehouse', 'Seattle')
ON CONFLICT (organization_id, warehouse_name) DO NOTHING;

INSERT INTO customers (organization_id, customer_name, customer_email)
VALUES
  (1, 'Avery Kim', 'avery.kim@example.com'),
  (1, 'Noah Patel', 'noah.patel@example.com'),
  (1, 'Sofia Rossi', 'sofia.rossi@example.com'),
  (4, 'Liam Chen', 'liam.chen@example.com'),
  (4, 'Maya Okafor', 'maya.okafor@example.com'),
  (4, 'Ethan Brooks', 'ethan.brooks@example.com'),
  (4, 'Amara Singh', 'amara.singh@example.com'),
  (5, 'Lucas Silva', 'lucas.silva@example.com'),
  (5, 'Zara Haddad', 'zara.haddad@example.com'),
  (5, 'Owen Nakamura', 'owen.nakamura@example.com')
ON CONFLICT (organization_id, customer_email) DO NOTHING;

INSERT INTO inventory (organization_id, product_id, warehouse_id, quantity_on_hand)
VALUES
  (1, 11, 1, 10),
  (1, 12, 2, 10),
  (4, 14, 3, 10),
  (4, 16, 5, 10),
  (5, 18, 6, 10)
ON CONFLICT (warehouse_id, product_id) DO NOTHING;

INSERT INTO inventory_movements (organization_id, product_id, warehouse_id, tr_type, quantity)
VALUES
  (1, 11, 1, 'stock_in', 10),
  (1, 12, 2, 'stock_in', 10),
  (4, 14, 3, 'stock_in', 10),
  (4, 16, 5, 'stock_in', 10),
  (5, 18, 6, 'stock_in', 10);

COMMIT;