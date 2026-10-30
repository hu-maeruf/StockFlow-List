import { Router } from "express";
import { postProduct } from "./product.controller.js";
import { auth } from "../../middleware/authenticate.js"
import { requireRoleFromHeader } from "../../middleware/requireRole.js";

export const productRoute = Router();

productRoute.post("/products", auth, requireRoleFromHeader("org_admin"), postProduct);