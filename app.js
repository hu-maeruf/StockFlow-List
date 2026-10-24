import express from "express";
import { route } from "./modules/auth/auth.route.js";

const app = express();

app.use(express.json());
app.use("/auth", route);

app.get("/health", (req, res) => {
  res.status(200).json({
    "status": "ok"
  })
});

export default app;