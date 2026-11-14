import AppError from "../../utils/AppError.js";

const MAX_NUM = 2147483647;
const MIN_NUM = 0;

export const validatePostOrder = (
  customer_id,
  product_id,
  warehouse_id,
  quantity,
) => {
  if (!customer_id || !product_id || !warehouse_id || !quantity) {
    throw new AppError(
      400,
      "customer_id, product_id, warehouse_id and quantity are required",
    );
  }

  if (
    !Number.isInteger(customer_id) ||
    !Number.isInteger(product_id) ||
    !Number.isInteger(warehouse_id) ||
    !Number.isInteger(quantity)
  ) {
    throw new AppError(
      400,
      "customer_id, product_id, warehouse_id and quantity should be Integer",
    );
  }

  if (
    !(MIN_NUM < customer_id && customer_id <= MAX_NUM) ||
    !(MIN_NUM < product_id && product_id <= MAX_NUM) ||
    !(MIN_NUM < warehouse_id && warehouse_id <= MAX_NUM) ||
    !(MIN_NUM < quantity && quantity <= MAX_NUM)
  ) {
    throw new AppError(
      400,
      "customer_id, product_id, warehouse_id and quantity should be greater than 0",
    );
  }
  return { customer_id, product_id, warehouse_id, quantity };
};

export const Validateidem = (header) => {
  const idemKey = header["idempotency-key"];
  if (!idemKey) {
    throw new AppError(400, "idempotency-key header is required");
  }

  if (typeof idemKey !== "string") {
    throw new AppError(400, "idempotency-key value must be string");
  }

  if (idemKey.length > 255) {
    throw new AppError(
      400,
      "idempotency-key should be less than 255 characters",
    );
  }
  return idemKey;
};
