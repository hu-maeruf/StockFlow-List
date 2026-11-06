import db from "../../config/db.js";

export const addCustomer = async (name, email, orgId) => {
  const result = await db.query("INSERT INTO customers (organization_id, customer_name, customer_email) VALUES ($1, $2, $3) RETURNING customer_id, customer_name, customer_email", [orgId, name, email]);
  return result.rows;
}

export const retrieveCustomers = async (orgId) => {
  const result = await db.query("SELECT customer_id, customer_name, customer_email FROM customers WHERE organization_id = $1 ORDER BY customer_id", [orgId]);
  return result.rows;
}