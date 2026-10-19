const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const normalizeInput = (name, email, password) => {
  if (typeof (name) !== "string" || typeof (email) !== "string" || typeof (password) !== "string") {
    throw new AppError(400, "name, email, and password are required");

  }

  name = name.trim()
  email = email.trim().toLowerCase()

  if (name.length === 0 || email.length === 0) {
    throw new AppError(400, "name and email are required");
  }

  if (name.length > 100) {
    throw new AppError(400, "name is too long");
  }

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    throw new AppError(400, "Invalid email");
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    throw new AppError(400, "Password must be at least 8 characters and no more than 72 bytes.");
  }

  return { name, email, password }
}