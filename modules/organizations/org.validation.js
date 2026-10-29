import AppError from "../../utils/AppError.js";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ["org_admin", "staff", "viewer"];

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
}

export const validateMemRegister = (email, role) => {
  if (typeof email !== "string" || typeof role !== "string") {
    throw new AppError(400, "Email and Role Required")
  }

  email = email.trim().toLowerCase();
  role = role.trim().toLowerCase();

  if (role.length === 0 || email.length === 0) {
    throw new AppError(400, "Email and Role Required");
  }

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    throw new AppError(400, "Invalid Email Format");
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new AppError(400, "Invalid role");
  }

  return { email, role }
}