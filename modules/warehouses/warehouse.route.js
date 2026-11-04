import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import { requireRoleFromHeader } from "../../middleware/requireRole.js";
import { postWarehouse } from "./warehouse.controller.js";

export const warehouseRoute = Router();

warehouseRoute.post("/warehouses", auth, requireRoleFromHeader("org_admin"), postWarehouse);