import express from "express";
import db from "./config/db.js";
import { route } from "./modules/auth/auth.route.js";

const app = express();

app.use(express.json());
app.use("/auth", route);

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    return res.status(200).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    "status": "ok"
  })
});

export default app;