import db from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import AppError from "../../utils/AppError.js";

const SALT_ROUND = 10
const dummyHash = await bcrypt.hash("dummy-password", SALT_ROUND);

export const registerUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUND);
  try {
    await db.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)", [name, email, hashedPassword]);
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(409, "Unable to register with that email");
    }
    throw error;
  }
}

export const loginUser = async ({ email, password }) => {
  const userExist = await db.query("SELECT user_id, email, password_hash FROM users WHERE email = $1", [email]);

  const user = userExist.rows[0];
  const compPassword = user ? user.password_hash : dummyHash;
  const validPassword = await bcrypt.compare(password, compPassword);
  if (!user || !validPassword) {
    throw new AppError(401, "Invalid Email or Password");
  }
  return jwt.sign({
    userID: user.user_id,
    email: user.email
  }, env.JWT_SECRET,
    { expiresIn: "10m" }
  )
}

export const getProfile = async () => {
  const user = await db.query("SELECT user_id, name, email FROM users WHERE user_id = $1", [req.user.userID]);

  if (!user.rows[0]) {
    throw new AppError(401, "User Not Found");
  }
}