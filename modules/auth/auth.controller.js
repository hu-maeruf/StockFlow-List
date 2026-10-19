import db from "../../config/db.js";
import bcrypt from "bcrypt";
import { AppError, normalizeInput } from "./auth.validation.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const input = normalizeInput(name, email, password);

    const hashedPassword = await bcrypt.hash(input.password, 10);
    await db.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)", [input.name, input.email, hashedPassword]);

    return res.status(201).json({
      message: "successfully registered"
    })

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Unable to register with that email"
      })
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }

    console.error(error.message)
    return res.status(500).json({
      message: "An unexpected error occurred"
    })
  }
}