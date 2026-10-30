import AppError from "../../utils/AppError.js"

export const validateProduct = (pr_sku, pr_name, pr_price) => {
  if (typeof pr_name !== "string" || typeof pr_sku !== "string" || typeof pr_price !== "number") {
    throw new AppError(400, "product_name, pr_sku and pr_price required");
  }

  pr_name = pr_name.trim().toLowerCase();
  pr_sku = pr_sku.trim().toLowerCase();

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