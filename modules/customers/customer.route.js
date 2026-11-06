import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import { requireRoleFromHeader } from "../../middleware/requireRole.js";
import { getCustomers, postCustomer } from "./customer.controller.js";

export const customerRoute = Router();

customerRoute.post("/customers", auth, requireRoleFromHeader("org_admin", "staff"), postCustomer);
customerRoute.get("/customers", auth, requireRoleFromHeader("org_admin", "staff", "viewer"), getCustomers);