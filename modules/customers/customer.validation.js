import AppError from "../../utils/AppError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeCustomer = (email, name) => {
  if (typeof (email) !== "string" || typeof (name) !== "string") {
    throw new AppError(400, "Name and Email required");
  }

  email = email.trim().toLowerCase();
  name = name.trim();

  if (email.length === 0 || name.length === 0) {
    throw new AppError(400, "Name and Email required");
  }

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    throw new AppError(400, "Invalid Email Format");
  }

  if (name.length > 100) {
    throw new AppError(400, "Name is too long");
  }
  return { name, email };
};