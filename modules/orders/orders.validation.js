import AppError from "../../utils/AppError.js";

const MAX_NUM = 2147483647;
const MIN_NUM = 0;
const ALLOWED_KEYS = ["warehouse_id", "product_id", "quantity"];

const validatePrWaQuant = ({ product_id, warehouse_id, quantity }) => {
  if (!product_id || !warehouse_id || !quantity) {
    throw new AppError(
      400,
      "product_id, warehouse_id and quantity are required",
    );
  }

  if (
    !Number.isInteger(product_id) ||
    !Number.isInteger(warehouse_id) ||
    !Number.isInteger(quantity)
  ) {
    throw new AppError(
      400,
      "product_id, warehouse_id and quantity should be Integer",
    );
  }

  if (
    !(MIN_NUM < product_id && product_id <= MAX_NUM) ||
    !(MIN_NUM < warehouse_id && warehouse_id <= MAX_NUM) ||
    !(MIN_NUM < quantity && quantity <= MAX_NUM)
  ) {
    throw new AppError(
      400,
      "product_id, warehouse_id and quantity should be greater than 0",
    );
  }
  return { product_id, warehouse_id, quantity };
};

const validateCustomer = (customer_id) => {
  if (!customer_id) {
    throw new AppError(400, "customer_id is required");
  }

  if (!Number.isInteger(customer_id)) {
    throw new AppError(400, "customer_id should be Integer");
  }

  if (!(MIN_NUM < customer_id && customer_id <= MAX_NUM)) {
    throw new AppError(400, "customer_id should be greater than 0");
  }
  return customer_id;
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

export const validatePostOrder = (cust_id, items) => {
  const container = [];
  const orders = [];
  const customer_id = validateCustomer(cust_id);

  if (!Array.isArray(items)) {
    throw new AppError(
      400,
      "{customer_id: id, items: [product_id: id, warehouse_id: id, quantity: quantity]} format is required",
    );
  }

  for (const [i, item] of items.entries()) {
    const keys = Object.keys(item);
    const missing = ALLOWED_KEYS.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !ALLOWED_KEYS.includes(k));

    if (missing.length > 0 || extra.length > 0) {
      const parts = [];
      if (missing.length > 0) {
        parts.push(`missing: ${missing.join(", ")}`);
      }
      if (extra.length > 0) {
        parts.push(`extra: ${extra.join(", ")}`);
      }
      throw new AppError(400, `items[${i}] has ${parts.join("; ")}`);
    }
    container.push(item);
  }

  for (const elem of container) {
    const item = validatePrWaQuant(elem);
    orders.push({
      product_id: item.product_id,
      warehouse_id: item.warehouse_id,
      quantity: item.quantity,
    });
  }

  return { customer_id, orders };
};
