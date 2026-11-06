import reqBody from "../../utils/reqBody.js";
import { normalizeCustomer } from "./customer.validation.js";
import { addCustomer, retrieveCustomers, retrieveCustomersByID } from "./customer.service.js";
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

export const getCustomers = async (req, res) => {
  try {
    const orgID = req.orgID;
    const customers = await retrieveCustomers(orgID);
    return res.status(200).json({
      customers
    })
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

export const getCustomersByID = async (req, res) => {
  try {
    const orgID = req.orgID;
    const customerID = Number(req.params.customerId);
    if (!Number.isSafeInteger(customerID) || customerID <= 0) {
      return res.status(404).json({
        message: "Customer Not Found"
      })
    }
    const customers = await retrieveCustomersByID(orgID, customerID);
    if (customers.length === 0) {
      return res.status(404).json({
        message: "Customer Not Found"
      })
    }
    return res.status(200).json({
      customers
    })
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