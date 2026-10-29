import { Router } from "express";
import { createOrg, getMembers, getOrg, registerMember } from "./org.controller.js";
import { auth } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";

export const orgRoute = Router();

orgRoute.post("/organizations", auth, createOrg);
orgRoute.get("/organizations/:organization_id", auth, requireRole("org_admin", "staff", "viewer"), getOrg);
orgRoute.post("/organizations/:organization_id/members", auth, requireRole("org_admin"), registerMember);
orgRoute.get("/organizations/:organization_id/members", auth, requireRole("org_admin", "staff", "viewer"), getMembers);