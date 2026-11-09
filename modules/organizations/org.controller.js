import reqBody from "../../utils/reqBody.js";
import AppError from "../../utils/AppError.js";
import { validateOrgRegister, validateMemRegister } from "./org.validation.js";
import { getMem, getOrgID, regMem, registerOrg } from "./org.service.js";

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
    const orgID = req.orgID;
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

export const registerMember = async (req, res) => {
  try {
    reqBody(req);
    const orgID = req.orgID;
    const { email, role } = req.body;
    const input = validateMemRegister(email, role);
    await regMem(input.email, input.role, orgID);
    return res.status(201).json({
      message: "User added to organization successfully"
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

export const getMembers = async (req, res) => {
  try {
    const orgID = req.orgID;
    const result = await getMem(orgID);
    return res.status(200).json(result);
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