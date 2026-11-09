import db from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export const addWarehouse = async (wah_name, wah_loc, orgID) => {
  const warehouse = await db.query(
    "SELECT 1 FROM warehouses WHERE organization_id = $1 AND warehouse_name = $2 LIMIT 1",
    [orgID, wah_name]
  );

  if (warehouse.rowCount > 0) {
    throw new AppError(409, "Warehouse name already exists");
  }

  const result = await db.query("INSERT INTO warehouses (organization_id, warehouse_name, warehouse_loc) VALUES ($1, $2, $3) ON CONFLICT (organization_id, warehouse_name) DO NOTHING", [orgID, wah_name, wah_loc]);

  if (result.rowCount === 0) {
    throw new AppError(409, "Warehouse name already exists");
  }
}

export const retrieveWarehouses = async (orgID) => {
  const result = await db.query("SELECT warehouse_id, warehouse_name, warehouse_loc FROM warehouses WHERE organization_id = $1 ORDER BY warehouse_id", [orgID]);
  return result.rows;
}

export const retrieveWarehousesByID = async (orgID, warehouseId) => {
  const result = await db.query("SELECT warehouse_id, warehouse_name, warehouse_loc FROM warehouses WHERE organization_id = $1 AND warehouse_id = $2 ORDER BY warehouse_id", [orgID, warehouseId]);
  return result.rows;
}