import db from "../../config/db.js";

export const registerOrg = async ({ name, slug }) => {
  await db.query("INSERT INTO organizations (name, slug) VALUES ($1, $2)", [name, slug]);
}