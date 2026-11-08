import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import {requireRoleFromHeader} from "../../middleware/requireRole.js";
import { postInventory } from "./inventory.controller.js";

export const inventoryRoute = Router();

inventoryRoute.post("/inventory/stock-in", auth, requireRoleFromHeader("org_admin", "staff"), postInventory);