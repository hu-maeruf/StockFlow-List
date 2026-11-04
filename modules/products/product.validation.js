import AppError from "../../utils/AppError.js"

const MAX_PRICE = 9999999999999.99;
const MIN_PRICE = 0.01;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_PAGE = 10000;
const MAX_LIMIT = 50;

const ALLOWED_STATUS = ["active", "archived"];
const ALLOWED_KEYS = ["product_name", "sku", "price", "product_status"];
const PAGINATION_KEYS = ["page", "limit", "sort", "order"];
const SORT_ALLOWED = ["price"];
const DIGITS_ONLY = /^\d+$/;

export const validateProduct = (pr_sku, pr_name, pr_price) => {
  if (typeof pr_name !== "string" || typeof pr_sku !== "string" || typeof pr_price !== "number") {
    throw new AppError(400, "product_name, pr_sku and pr_price required");
  }

  pr_name = pr_name.trim().toLowerCase();
  pr_sku = pr_sku.trim();

  if (!pr_name || !pr_sku || !pr_price) {
    throw new AppError(400, "product_name, pr_sku and pr_price required");
  }

  if (pr_name.length > 100 || pr_sku.length > 20) {
    throw new AppError(400, "pr_name or pr_sku is too long");
  }

  if (!Number.isFinite(pr_price) ||
    pr_price < 0.01 ||
    pr_price > 9999999999999.99) {
    throw new AppError(400, "pr_price can't be 0 or low");
  }
  return { pr_sku, pr_name, pr_price }
}

const cleanName = (value) => {
  if (typeof value !== "string") {
    throw new AppError(400, "product_name must be a string")
  }
  const name = value.trim().toLowerCase();
  if (name === "") {
    throw new AppError(400, "product_name cannot be empty")
  }
  if (name.length > 100) {
    throw new AppError(400, "product_name must be at most 100 characters")
  }
  return name;
}

const cleanSku = (value) => {
  if (typeof value !== "string") {
    throw new AppError(400, "sku must be a string")
  }
  const sku = value.trim();
  if (sku === "") {
    throw new AppError(400, "sku cannot be empty")
  }
  if (sku.length > 20) {
    throw new AppError(400, "sku must be at most 20 characters")
  }
  return sku;
}

const cleanPrice = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AppError(400, "price must be a number");
  }
  if (value < MIN_PRICE || value > MAX_PRICE) {
    throw new AppError(400, `price must be between ${MIN_PRICE} and ${MAX_PRICE}`);
  }
  if (Number(value.toFixed(2)) !== value) {
    throw new AppError(400, "price can have at most 2 decimal places");
  }
  return value;
}

const cleanStatus = (value) => {
  if (typeof value !== "string") {
    throw new AppError(400, "product_status must be a string");
  }
  const status = value.trim().toLowerCase();
  if (!ALLOWED_STATUS.includes(status)) {
    throw new AppError(400, `product_status must be one of: ${ALLOWED_STATUS.join(", ")}`);
  }
  return status;
}

export const updatedValues = (body, prID, orgID) => {
  const values = [];
  const updates = [];
  const invalidKey = Object.keys(body).filter((key) => !ALLOWED_KEYS.includes(key));

  if (invalidKey.length > 0) {
    throw new AppError(400, "Unknown filed");
  }

  if (body.product_name !== undefined) {
    const pr_name = cleanName(body.product_name);
    values.push(pr_name);
    updates.push(`product_name = $${values.length}`);
  }

  if (body.sku !== undefined) {
    const pr_sku = cleanSku(body.sku);
    values.push(pr_sku);
    updates.push(`sku = $${values.length}`);
  }

  if (body.price !== undefined) {
    const pr_price = cleanPrice(body.price);
    values.push(pr_price);
    updates.push(`price = $${values.length}`);
  }

  if (body.product_status !== undefined) {
    const pr_status = cleanStatus(body.product_status);
    values.push(pr_status);
    updates.push(`product_status = $${values.length}`);
  }

  if (updates.length === 0) {
    throw new AppError(400, "At least one field must be provided");
  }
  values.push(prID, orgID);
  return { values, updates };
}

const filtPagination = (upper, val, key, defVal) => {
  if (val === undefined) {
    return defVal;
  }
  if (typeof val !== "string" || !DIGITS_ONLY.test(val)) {
    throw new AppError(400, `${key} must be a positive whole number`);
  }
  const num = Number(val);
  if (num < 1 || num > upper) {
    throw new AppError(400, `${key} must be between 1 and ${upper}`);
  }
  return num;
};

const filtSorting = (val) => {
  if (val === undefined) {
    return "product_id"
  }
  if (typeof val !== "string") {
    throw new AppError(400, "sort can only be a string");
  }
  val = val.trim().toLowerCase();
  if (!SORT_ALLOWED.includes(val)) {
    throw new AppError(400, `sort can only be ${SORT_ALLOWED.join(" or ")}`);
  }
  val = val === "price" ? "price" : "product_id";
  return val;
}

const filtOrder = (val) => {
  if (val === undefined) {
    return "ASC";
  }
  if (typeof val !== "string") {
    throw new AppError(400, "order can only be a string");
  }
  val = val.trim().toUpperCase();
  if (!["ASC", "DESC"].includes(val)) {
    throw new AppError(400, "order can only be ASC or DESC");
  }
  val = val === "DESC" ? "DESC" : "ASC";
  return val;
}

const filterName = (pr_name) => {
  if (typeof pr_name !== "string") {
    throw new AppError(400, "product_name should be string");
  }
  pr_name = pr_name.trim().toLowerCase();
  if (pr_name.length === 0 || pr_name.length > 100) {
    throw new AppError(400, "Invalid product_name");
  }
  return pr_name;
};

const filterStatus = (pr_status) => {
  if (typeof pr_status !== "string") {
    throw new AppError(400, "product_status should be string");
  }
  pr_status = pr_status.trim().toLowerCase();
  if (!ALLOWED_STATUS.includes(pr_status)) {
    throw new AppError(400, "Invalid product_status");
  }
  return pr_status;
}

const filterObj = {
  name: { validate: filterName, tempSql: "product_name =" },
  status: { validate: filterStatus, tempSql: "product_status =" }
};

export const getProductByFilter = (query, key, orgID) => {
  const unknownKey = Object.keys(query).filter((k) => !Object.hasOwn(filterObj, k) && !PAGINATION_KEYS.includes(k));
  if (unknownKey.length > 0) {
    throw new AppError(400, `Invalid query: ${unknownKey.join(", ")}`);
  }
  const page = filtPagination(MAX_PAGE, query.page, "page", DEFAULT_PAGE);
  const limit = filtPagination(MAX_LIMIT, query.limit, "limit", DEFAULT_LIMIT);
  const sortVal = filtSorting(query.sort);
  const ordVal = filtOrder(query.order);
  const values = [orgID];
  const placeholderSql = [`organization_id = $${values.length}`];

  for (let item = 0; item < key.length; item++) {
    if (Object.hasOwn(filterObj, key[item])) {
      const temp = filterObj[key[item]].validate;
      const result = temp(query[key[item]]);
      values.push(result);
      placeholderSql.push(`${filterObj[key[item]].tempSql} $${values.length}`);
    }
  }

  values.push(limit, (page - 1) * limit)
  return { values, placeholderSql, sortVal, ordVal, }
}