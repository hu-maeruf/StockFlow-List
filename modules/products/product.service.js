import db from "../../config/db.js";

export const addProducts = async (pr_sku, pr_name, pr_price, orgID) => {
  await db.query("INSERT INTO products (organization_id, sku, product_name, price) VALUES ($1, $2, $3, $4)", [orgID, pr_sku, pr_name, pr_price]);
}