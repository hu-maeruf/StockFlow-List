import db from "../../config/db.js";
import bcrypt from "bcrypt";
import AppError from "../../utils/AppError.js";
import reqBody from "../../utils/reqBody.js";
import { normalizeRegister, normalizeLogin } from "./auth.validation.js";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const SALT_ROUND = 10
const dummyHash = await bcrypt.hash("dummy-password", SALT_ROUND);

export const register = async (req, res) => {
  try {
    reqBody(req);
    const { name, email, password } = req.body;

    const input = normalizeRegister(name, email, password);

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUND);
    await db.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)", [input.name, input.email, hashedPassword]);

    return res.status(201).json({
      message: "Registered Successfully"
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
      message: "Unexpected Error Occurred"
    })
  }
}

export const login = async (req, res) => {
  try {
    reqBody(req);
    const { email, password } = req.body;
    const input = normalizeLogin(email, password);

    const userExist = await db.query("SELECT user_id, email, password_hash FROM users WHERE email = $1", [input.email]);

    const user = userExist.rows[0];
    const compPassword = user ? user.password_hash : dummyHash;
    const validPassword = await bcrypt.compare(password, compPassword);
    if (!user || !validPassword) {
      return res.status(401).json({
        message: "Invalid Email or Password"
      })
    }

    const token = jwt.sign({
      userID: user.user_id,
      email: user.email
    }, env.JWT_SECRET,
      { expiresIn: "10m" }
    )

    res.status(200).json({ token });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }
    console.error(error)
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await db.query("SELECT user_id, name, email FROM users WHERE user_id = $1", [req.user.userID]);

    if (!user.rows[0]) {
      return res.status(401).json({
        message: "User Not Found"
      })
    }

    res.status(200).json(user.rows[0])
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}