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

export const getOrgID = async (orgID) => {
  try {
    const orgInfo = await db.query("SELECT name, slug FROM organizations WHERE organization_id = $1", [orgID]);
    return orgInfo.rows[0];
  } catch (error) {
    throw error;
  }
}

export const regMem = async (email, role, orgID) => {
  try {
    const result = await db.query("SELECT user_id FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      throw new AppError(404, "User Not Found");
    } // This user haven't registered

    const newUserID = result.rows[0].user_id;

    await db.query("INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3)", [orgID, newUserID, role]);
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(409, "User is already member");
    }
    throw error;
  }
}

export const getMem = async (orgID) => {
  const result = await db.query(`
    SELECT users.user_id, users.name, org_mem.role FROM users 
    JOIN organization_members AS org_mem ON users.user_id = org_mem.user_id
    WHERE org_mem.organization_id = $1 ORDER BY users.user_id`, [orgID]);
  return result.rows;
}