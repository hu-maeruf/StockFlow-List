BEGIN;

CREATE TABLE products(
	product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	organization_id INT NOT NUll REFERENCES organizations(organization_id),
	sku VARCHAR(20) NOT NULL,
	product_name VARCHAR(100) NOT NULL,
	price DECIMAL(15, 2) NOT NULL CHECK (price > 0),
	product_status TEXT NOT NULL DEFAULT 'active' CHECK (product_status IN ('active', 'archived')),
	UNIQUE (organization_id, sku)
);

CREATE TABLE warehouses(
	warehouse_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	organization_id INT NOT NUll REFERENCES organizations(organization_id),
	warehouse_name VARCHAR(100) NOT NULL,
	warehouse_loc VARCHAR(100)
);

CREATE TABLE customers(
	customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	organization_id INT NOT NUll REFERENCES organizations(organization_id),
	customer_name VARCHAR(100) NOT NULL,
	customer_email VARCHAR(255) NOT NULL CHECK (customer_email = LOWER(customer_email)),
	UNIQUE (organization_id, customer_email)
);

COMMIT;