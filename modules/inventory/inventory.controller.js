import reqBody from "../../utils/reqBody.js";
import AppError from "../../utils/AppError.js";
import { validateGetInventory, validateInventory } from "./inventory.validation.js";
import { addInventory, retrieveInventory } from "./inventory.service.js";

export const postInventory = async (req, res) => {
  try {
    reqBody(req);
    const { product_id, warehouse_id, quantity } = req.body;
    const input = validateInventory(product_id, warehouse_id, quantity);
    const orgID = req.orgID;
    const stock_in = await addInventory(input.product_id, input.warehouse_id, input.quantity, orgID);
    return res.status(201).json({
      message: "Inventory Added",
      stock_in
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

export const getInventory = async (req, res) => {
  try {
    const input = validateGetInventory(req.query, req.orgID);
    const inventory = await retrieveInventory(input);
    return res.status(200).json({inventory});
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