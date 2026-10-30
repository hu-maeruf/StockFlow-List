import { Router } from "express";
import { postProduct, getProducts } from "./product.controller.js";
import { auth } from "../../middleware/authenticate.js"
import { requireRoleFromHeader } from "../../middleware/requireRole.js";

export const productRoute = Router();

productRoute.post("/products", auth, requireRoleFromHeader("org_admin"), postProduct);
productRoute.get("/products", auth, requireRoleFromHeader("org_admin", "staff", "viewer"), getProducts);