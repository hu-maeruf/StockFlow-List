import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import { requireRoleFromHeader } from "../../middleware/requireRole.js";
import {
  postOrders,
  reserveOrderByID,
  confirmOrder,
  cancelOrderById,
} from "./orders.controller.js";

export const orderRoute = Router();

orderRoute.post(
  "/orders",
  auth,
  requireRoleFromHeader("org_admin", "staff"),
  postOrders,
);
orderRoute.post(
  "/orders/:orderId/reserve",
  auth,
  requireRoleFromHeader("org_admin", "staff"),
  reserveOrderByID,
);
orderRoute.post(
  "/orders/:orderId/confirm",
  auth,
  requireRoleFromHeader("org_admin", "staff"),
  confirmOrder,
);

orderRoute.post(
  "/orders/:orderId/cancel",
  auth,
  requireRoleFromHeader("org_admin", "staff"),
  cancelOrderById,
);
