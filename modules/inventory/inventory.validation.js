import AppError from "../../utils/AppError.js";

const MAX_INT = 2000000000;

export const validateInventory = (product_id, warehouse_id, quantity) => {

  if (!product_id || !warehouse_id || !quantity) {
    throw new AppError(400, "product_id, warehouse_id and quantity are required");
  }

  if (!Number.isInteger(product_id) || !Number.isInteger(warehouse_id) || !Number.isInteger(quantity)) {
    throw new AppError(400, "product_id, warehouse_id and quantity should be Integer");
  }

  if (product_id <= 0 || warehouse_id <= 0 || quantity <= 0) {
    throw new AppError(400, "product_id, warehouse_id and quantity should be greater than 0");
  }

  if (product_id > MAX_INT || warehouse_id > MAX_INT || quantity > MAX_INT) {
    throw new AppError(400, "product_id or warehouse_id or quantity is too large");
  }

  return { product_id, warehouse_id, quantity }
}