import db from "../../config/db.js";

export const addWarehouse = async (wah_name, wah_loc, orgID) => {
  await db.query("INSERT INTO warehouses (organization_id, warehouse_name, warehouse_loc) VALUES ($1, $2, $3)", [orgID, wah_name, wah_loc]);
}
