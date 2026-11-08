import reqBody from "../../utils/reqBody.js";
import AppError from "../../utils/AppError.js";
import { validateInventory } from "./inventory.validation.js";
import {addInventory} from "./inventory.service.js";

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