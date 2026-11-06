import reqBody from "../../utils/reqBody.js";
import { normalizeCustomer } from "./customer.validation.js";
import { addCustomer } from "./customer.service.js";
import AppError from "../../utils/AppError.js";

export const postCustomer = async (req, res) => {
  try {
    reqBody(req);
    const { name, email } = req.body;
    const orgID = req.orgID;
    const input = normalizeCustomer(email, name);
    const result = await addCustomer(input.name, input.email, orgID);
    return res.status(201).json({
      message: "Customer added",
      "Customer info": result
    })
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Customer already registered"
      })
    }
    console.error(error.message);
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}