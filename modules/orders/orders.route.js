import { Router } from "express";
import {auth} from "../../middleware/authenticate.js";
import {requireRoleFromHeader} from "../../middleware/requireRole.js";
import { postOrders } from "./orders.controller.js";

export const orderRoute = Router();

orderRoute.post("/orders", auth, requireRoleFromHeader("org_admin", "staff"), postOrders);