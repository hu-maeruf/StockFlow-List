import { Router } from "express";
import { createOrg } from "./org.controller.js";

export const orgRoute = Router();

orgRoute.post("/organizations", createOrg);