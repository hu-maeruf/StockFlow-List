import { Router } from "express";
import { createOrg } from "./org.controller.js";
import { auth } from "../../middleware/authenticate.js";

export const orgRoute = Router();

orgRoute.post("/organizations", auth, createOrg);