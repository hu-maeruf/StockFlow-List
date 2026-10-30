import db from "../config/db.js";
import AppError from "../utils/AppError.js";

export const requireRoleFromUrl = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const orgID = Number(req.params.organization_id);
      const userID = req.user.userID;
      const memRole = await verifyMembership(userID, orgID, allowedRoles);
      req.role = memRole.role;
      req.orgID = orgID;
      return next();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message
        })
      }
      console.error(error);
      return res.status(500).json({
        message: "Unexpected Error Occurred"
      })
    }
  }
}

export const verifyMembership = async (userID, orgID, allowedRoles) => {
  if (!Number.isSafeInteger(orgID) || orgID <= 0) {
    throw new AppError(404, "Organization Not Found")
  }

  const checkRole = await db.query("SELECT role FROM organization_members WHERE user_id = $1 AND organization_id = $2", [userID, orgID]);

  const membership = checkRole.rows[0];
  if (!membership) {
    throw new AppError(404, "Organization Not Found")
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new AppError(403, "Insufficient permissions")
  }
  return membership;
}