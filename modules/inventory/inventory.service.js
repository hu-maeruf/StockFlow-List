import db from "../../config/db.js";
import AppError from "../../utils/AppError.js";

const MAX_INT = 2000000000;

export const addInventory = async (product_id, warehouse_id, quantity, orgId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const pr_available = await client.query("SELECT product_id FROM products WHERE organization_id = $1 AND product_id = $2", [orgId, product_id]);
    if (pr_available.rowCount === 0){
      throw new AppError(404, "Product Not Found");
    }

    const warehouse_available = await client.query("SELECT warehouse_id FROM warehouses WHERE organization_id = $1 AND warehouse_id = $2", [orgId, warehouse_id]);

    if (warehouse_available.rowCount === 0){
      throw new AppError(404, "Warehouse Not Found");
    }
    
    await client.query("INSERT INTO inventory (organization_id, product_id, warehouse_id, quantity_on_hand) VALUES ($1, $2, $3, $4) ON CONFLICT (warehouse_id, product_id) DO NOTHING", [orgId, product_id, warehouse_id, 0]);

    const result = await client.query("SELECT inventory_id, quantity_on_hand FROM inventory WHERE organization_id = $1 AND product_id = $2 AND warehouse_id = $3 FOR UPDATE", [orgId, product_id, warehouse_id]);

    const amount = result.rows[0].quantity_on_hand + quantity;

    if (amount > MAX_INT){
      throw new AppError(400, "Total quantity is too large")
    }

    await client.query("UPDATE inventory SET quantity_on_hand = $1, updated_at = now() WHERE organization_id = $2 AND product_id = $3 AND warehouse_id = $4", [amount, orgId, product_id, warehouse_id]);

    const stock_in = await client.query("INSERT INTO inventory_movements (organization_id, product_id, warehouse_id, tr_type, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING inventory_mov_id, product_id, warehouse_id, tr_type, reference_id", [orgId, product_id, warehouse_id, 'stock_in', quantity]);

    stock_in.rows[0]["quantity"] = amount;

    await client.query("COMMIT");
    return stock_in.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  finally{
    client.release();
  }
}

export const retrieveInventory = async ({values, placeholderSql}) => {
  const result = await db.query(`SELECT inventory_id, warehouse_id, product_id, quantity_on_hand, quantity_reserved, quantity_on_hand - quantity_reserved AS quantity_available FROM inventory WHERE ${placeholderSql.join(" AND ")} ORDER BY inventory_id`, values);

  return result.rows;
}