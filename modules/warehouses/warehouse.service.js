import db from "../../config/db.js";

export const addWarehouse = async (wah_name, wah_loc, orgID) => {
  await db.query("INSERT INTO warehouses (organization_id, warehouse_name, warehouse_loc) VALUES ($1, $2, $3)", [orgID, wah_name, wah_loc]);
}

export const retrieveWarehouses = async (orgID) => {
  const result = await db.query("SELECT warehouse_id, warehouse_name, warehouse_loc FROM warehouses WHERE organization_id = $1 ORDER BY warehouse_id", [orgID]);
  return result.rows;
}

export const retrieveWarehousesByID = async (orgID, warehouseId) => {
  const result = await db.query("SELECT warehouse_id, warehouse_name, warehouse_loc FROM warehouses WHERE organization_id = $1 AND warehouse_id = $2 ORDER BY warehouse_id", [orgID, warehouseId]);
  return result.rows;
}