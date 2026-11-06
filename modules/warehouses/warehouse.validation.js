import AppError from "../../utils/AppError.js";

export const validateWarehouse = (wah_name, wah_loc) => {
  if (typeof wah_name !== "string" || typeof wah_loc !== "string") {
    throw new AppError(400, "warehouse_name and warehouse_loc required");
  }

  wah_name = wah_name.trim().toLowerCase();
  wah_loc = wah_loc.trim().toLowerCase();

  if (!wah_name || !wah_loc) {
    throw new AppError(400, "warehouse_name and warehouse_loc required");
  }

  if (wah_name.length > 100 || wah_loc.length > 100) {
    throw new AppError(400, "warehouse_name or warehouse_loc is too long");
  }
  return { wah_name, wah_loc }
}