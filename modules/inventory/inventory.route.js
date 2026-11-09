import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import {requireRoleFromHeader} from "../../middleware/requireRole.js";
import { postInventory, getInventory, postTransfer } from "./inventory.controller.js";

export const inventoryRoute = Router();

inventoryRoute.post("/inventory/stock-in", auth, requireRoleFromHeader("org_admin", "staff"), postInventory);
inventoryRoute.get("/inventory", auth, requireRoleFromHeader("org_admin", "staff", "viewer"), getInventory);
inventoryRoute.post("/inventory/transfer", auth, requireRoleFromHeader("org_admin", "staff"), postTransfer);