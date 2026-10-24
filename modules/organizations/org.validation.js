import AppError from "../../utils/AppError.js";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const validateOrgRegister = (name, slug) => {
  if (typeof name !== "string" || typeof slug !== "string") {
    throw new AppError(400, "Name and slug Required");
  }

  name = name.trim();
  slug = slug.trim();

  if (!name || !slug) {
    throw new AppError(400, "Name and slug is required");
  }

  if (name.length > 100 || slug.length > 100) {
    throw new AppError(400, "Name or slug is too long");
  }

  if (!SLUG_REGEX.test(slug)) {
    throw new AppError(400, "Slug must contain lowercase letters or numbers, separated by single hyphens");
  }
  return { name, slug }
};