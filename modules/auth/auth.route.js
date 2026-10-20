import { Router } from "express";
import { register, login } from "./auth.controller.js";

export const route = Router();

route.post("/register", register);
route.post("/login", login);