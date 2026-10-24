import AppError from "../../utils/AppError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  if (typeof (email) !== "string") {
    throw new AppError(400, "Invalid Email")
  }

  email = email.trim().toLowerCase();

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    throw new AppError(400, "Invalid Email Format");
  }

  return email;
};

export const normalizeRegister = (name, e_mail, password) => {
  if (typeof (name) !== "string" || typeof (password) !== "string") {
    throw new AppError(400, "Name, Email and Password Required");

  }

  const email = normalizeEmail(e_mail)
  name = name.trim()

  if (name.length === 0 || email.length === 0) {
    throw new AppError(400, "Name, Email and Password Required");
  }

  if (name.length > 100) {
    throw new AppError(400, "Name is too long");
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    throw new AppError(400, "Password must be at least 8 characters and no more than 72 bytes.");
  }

  return { name, email, password }
};

export function normalizeLogin(e_mail, password) {
  const email = normalizeEmail(e_mail);
  if (typeof (password) !== "string") {
    throw new AppError(400, "Invalid Email or Password");

  }

  if (password.length === 0 || email.length === 0) {
    throw new AppError(400, "Email and Password Required");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new AppError(400, "Invalid Email or Password");
  }

  return { email, password }
};