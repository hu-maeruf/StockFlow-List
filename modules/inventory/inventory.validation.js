import AppError from "../../utils/AppError.js";

const MAX_INT = 2000000000;
const DIGITS_ONLY = /^\d+$/;

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

const filtVal = (raw, key) => {
  if (typeof raw !== "string" || !DIGITS_ONLY.test(raw)) {
    throw new AppError(400, `${key} should be a positive whole number`);
  }
  const value = Number(raw);
  if (value <= 0 || value > MAX_INT) {
    throw new AppError(400, `${key} must be between 1 and ${MAX_INT}`);
  }
  return value;
};

const filtObject = {
  product_id: {validate: filtVal, tempSql: "product_id ="},
  warehouse_id: {validate: filtVal, tempSql: "warehouse_id ="}
}

export const validateGetInventory = (query, orgId) => {
  const keys = Object.keys(query);
  const unknown = Object.keys(query).filter((k) => !Object.hasOwn(filtObject, k));

  if (unknown.length > 0){
    throw new AppError(400, `Invalid query: ${unknown.join(", ")}`);
  }
  const values = [orgId];
  const placeholderSql = [`organization_id = $${values.length}`];

  for (const key of keys){
    const {validate, tempSql} = filtObject[key];
    values.push(validate(query[key], key));
    placeholderSql.push(`${tempSql} $${values.length}`);
  }

  return { values, placeholderSql }
}

export const validateTransfer = (source_ware_id, destination_ware_id, product_id, quantity) => {

  if (!product_id || !source_ware_id || !destination_ware_id || !quantity) {
    throw new AppError(400, "source_ware_id, destination_ware_id, product_id and quantity are required");
  }

  if (!Number.isInteger(product_id) || !Number.isInteger(source_ware_id) || !Number.isInteger(destination_ware_id) || !Number.isInteger(quantity)) {
    throw new AppError(400, "source_ware_id, destination_ware_id, product_id and quantity should be Integer");
  }

  if (product_id <= 0 || source_ware_id <= 0 || destination_ware_id <= 0 || quantity <= 0) {
    throw new AppError(400, "source_ware_id, destination_ware_id, product_id and quantity should be greater than 0");
  }

  if (product_id > MAX_INT || source_ware_id > MAX_INT || destination_ware_id > MAX_INT || quantity > MAX_INT) {
    throw new AppError(400, "source_ware_id, destination_ware_id or product_id or quantity is too large");
  }

  return { source_ware_id, destination_ware_id, product_id, quantity }
}