import reqBody from "../../utils/reqBody.js";
import AppError from "../../utils/AppError.js";
import { validateOrgRegister } from "./org.validation.js";
import { registerOrg } from "./org.service.js";

export const createOrg = async (req, res) => {
  try {
    reqBody(req);
    const { name, slug } = req.body;
    const input = validateOrgRegister(name, slug);
    await registerOrg(input.name, input.slug, req.user.userID);
    return res.status(201).json({
      message: "Organization Registered"
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }
    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}