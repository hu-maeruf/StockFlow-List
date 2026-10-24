import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided"
    })
  };

  const token = header.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    })
  }

  req.user = decoded;
  return next();
};