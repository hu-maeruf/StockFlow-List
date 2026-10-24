import { Router } from "express";
import { register, login, getMe } from "./auth.controller.js";
import { auth } from "../../middleware/authenticate.js";

export const route = Router();

route.post("/register", register);
route.post("/login", login);
route.get("/me", auth, getMe);