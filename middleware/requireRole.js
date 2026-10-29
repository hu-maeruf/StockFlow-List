import db from "../config/db.js";

export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const orgID = Number(req.params.organization_id);

      if (!Number.isSafeInteger(orgID) || orgID <= 0) {
        return res.status(404).json({
          message: "Organization Not Found"
        })
      }

      const userID = req.user.userID;
      const checkRole = await db.query("SELECT role FROM organization_members WHERE user_id = $1 AND organization_id = $2", [userID, orgID]);

      const membership = checkRole.rows[0];
      if (!membership) {
        return res.status(404).json({
          message: "Organization Not Found"
        })
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          message: "Insufficient permissions"
        })
      }
      return next();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Unexpected Error Occurred"
      })
    }
  }
}