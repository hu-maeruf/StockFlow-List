import { Router } from "express";
import { createOrg, getMembers, getOrg, registerMember } from "./org.controller.js";
import { auth } from "../../middleware/authenticate.js";
import { requireRoleFromUrl } from "../../middleware/requireRole.js";

export const orgRoute = Router();

orgRoute.post("/organizations", auth, createOrg);
orgRoute.get("/organizations/:organization_id", auth, requireRoleFromUrl("org_admin", "staff", "viewer"), getOrg);
orgRoute.post("/organizations/:organization_id/members", auth, requireRoleFromUrl("org_admin"), registerMember);
orgRoute.get("/organizations/:organization_id/members", auth, requireRoleFromUrl("org_admin", "staff", "viewer"), getMembers);