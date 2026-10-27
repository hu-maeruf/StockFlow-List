import { Router } from "express";
import { createOrg, getOrg } from "./org.controller.js";
import { auth } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";

export const orgRoute = Router();

orgRoute.post("/organizations", auth, createOrg);
orgRoute.get("/organizations/:organization_id", auth, requireRole("org_admin", "staff", "viewer"), getOrg);