import { Router } from "express";
import { register, login, getMe } from "./auth.controller.js";
import { auth } from "../../middleware/authenticate.js";

export const authRoute = Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/me", auth, getMe);