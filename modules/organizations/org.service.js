import db from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export const registerOrg = async (name, slug, userId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const org = await client.query("INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING organization_id", [name, slug]);
    const orgID = org.rows[0].organization_id;

    await client.query("INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, 'org_admin')", [orgID, userId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      throw new AppError(409, "slug is already taken");
    }
    throw error;
  } finally {
    client.release();
  }
}