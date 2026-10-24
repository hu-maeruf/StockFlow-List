import express from "express";
import { authRoute } from "./modules/auth/auth.route.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoute);

app.get("/health", (req, res) => {
  res.status(200).json({
    "status": "ok"
  })
});

export default app;