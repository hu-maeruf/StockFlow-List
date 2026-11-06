import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import { requireRoleFromHeader } from "../../middleware/requireRole.js";
import { postCustomer } from "./customer.controller.js";

export const customerRoute = Router();

customerRoute.post("/customers", auth, requireRoleFromHeader("org_admin", "staff"), postCustomer);