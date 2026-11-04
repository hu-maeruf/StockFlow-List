import express from "express";
import { authRoute } from "./modules/auth/auth.route.js";
import { orgRoute } from "./modules/organizations/org.route.js";
import { productRoute } from "./modules/products/product.route.js";
import { warehouseRoute } from "./modules/warehouses/warehouse.route.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoute);
app.use("/", orgRoute);
app.use("/", productRoute);
app.use("/", warehouseRoute);

app.get("/health", (req, res) => {
  res.status(200).json({
    "status": "ok"
  })
});

export default app;