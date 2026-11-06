import db from "../../config/db.js";

export const addCustomer = async (name, email, orgId) => {
  const result = await db.query("INSERT INTO customers (organization_id, customer_name, customer_email) VALUES ($1, $2, $3) RETURNING customer_id, customer_name, customer_email", [orgId, name, email]);
  return result.rows;
}