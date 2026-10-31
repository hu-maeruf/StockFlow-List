import db from "../../config/db.js";

export const addProducts = async (pr_sku, pr_name, pr_price, orgID) => {
  await db.query("INSERT INTO products (organization_id, sku, product_name, price) VALUES ($1, $2, $3, $4)", [orgID, pr_sku, pr_name, pr_price]);
}

export const retrieveProducts = async (orgID) => {
  const result = await db.query("SELECT product_id, product_name, sku, price FROM products WHERE organization_id = $1", [orgID]);

  return result.rows;
}

export const retrieveProductByID = async (orgID, prID) => {
  const result = await db.query("SELECT product_id, product_name, sku, price FROM products WHERE organization_id = $1 AND product_id = $2", [orgID, prID]);

  return result.rows;
}

export const updatePatch = async (values, updates) => {
  const result = await db.query(`UPDATE products SET ${updates.join(", ")} WHERE product_id = $${values.length - 1} AND organization_id = $${values.length} RETURNING product_id, product_name, sku, price, product_status`, values);
  return result.rows;
}