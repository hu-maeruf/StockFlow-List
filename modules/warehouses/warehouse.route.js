import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import { requireRoleFromHeader } from "../../middleware/requireRole.js";
import { postWarehouse, getWarehouses, getWarehousesByID } from "./warehouse.controller.js";

export const warehouseRoute = Router();

warehouseRoute.post("/warehouses", auth, requireRoleFromHeader("org_admin"), postWarehouse);
warehouseRoute.get("/warehouses", auth, requireRoleFromHeader("org_admin", "staff", "viewer"), getWarehouses);
warehouseRoute.get("/warehouses/:warehouseId", auth, requireRoleFromHeader("org_admin", "staff", "viewer"), getWarehousesByID);