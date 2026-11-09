import reqBody from "../../utils/reqBody.js";
import { addWarehouse, retrieveWarehouses, retrieveWarehousesByID } from "./warehouse.service.js";
import { validateWarehouse } from "./warehouse.validation.js";
import AppError from "../../utils/AppError.js"

export const postWarehouse = async (req, res) => {
  try {
    reqBody(req);
    const { warehouse_name, warehouse_loc } = req.body;
    const input = validateWarehouse(warehouse_name, warehouse_loc);
    const orgID = req.orgID;
    await addWarehouse(input.wah_name, input.wah_loc, orgID);
    return res.status(201).json({
      message: "Warehouse Added"
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

export const getWarehouses = async (req, res) => {
  try {
    const orgID = req.orgID;
    const warehouses = await retrieveWarehouses(orgID);
    return res.status(200).json({
      warehouses
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

export const getWarehousesByID = async (req, res) => {
  try {
    const orgID = req.orgID;
    const warehouseID = Number(req.params.warehouseId);
    if (!Number.isSafeInteger(warehouseID) || warehouseID <= 0) {
      return res.status(404).json({
        message: "Warehouse Not Found"
      })
    }
    const warehouses = await retrieveWarehousesByID(orgID, warehouseID);
    if (warehouses.length === 0) {
      return res.status(404).json({
        message: "Warehouse Not Found"
      })
    }
    return res.status(200).json({
      warehouses
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