import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import { requireRoleFromHeader } from "../../middleware/requireRole.js";
import { postWarehouse, getWarehouses } from "./warehouse.controller.js";

export const warehouseRoute = Router();

warehouseRoute.post("/warehouses", auth, requireRoleFromHeader("org_admin"), postWarehouse);
warehouseRoute.get("/warehouses", auth, requireRoleFromHeader("org_admin", "staff", "viewer"), getWarehouses);