import reqBody from "../../utils/reqBody.js";
import AppError from "../../utils/AppError.js";
import { validateOrgRegister } from "./org.validation.js";
import { getOrgID, registerOrg } from "./org.service.js";

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

export const getOrg = async (req, res) => {
  try {
    const orgID = req.params.organization_id;
    const orgInfo = await getOrgID(orgID);
    return res.status(200).json({
      message: orgInfo
    })
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }
    console.error(error);
    res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }

}