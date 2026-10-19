import { Router } from "express";
import { register } from "./auth.controller.js";

export const route = Router();

route.post("/register", register);