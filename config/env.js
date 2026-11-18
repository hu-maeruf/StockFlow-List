import dotenv from "dotenv";
import AppError from "../utils/AppError.js";

dotenv.config({
  path: "../.env",
});

function required(name) {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    throw new AppError(400, `Missing required environment variable: ${name}`);
  }

  return value;
}

function requiredMinute(min, fallback) {
  const raw = process.env[min] ?? fallback;

  const minutes = Number(raw);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 10080) {
    throw new AppError(400, `${min} must be between 1 and 10080`);
  }
  return minutes;
}

function readPort(name, fallback) {
  const value = process.env[name] ?? fallback;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new AppError(
      400,
      `${name} must be a whole number and between 1 and 65535`,
    );
  }

  return parsed;
}

export const env = {
  PORT: readPort("PORT", 3000),
  DB_PORT: readPort("DB_PORT", 5432),
  DB_NAME: required("DB_NAME"),
  DB_HOST: required("DB_HOST"),
  DB_USER: required("DB_USER"),
  DB_PASSWORD: required("DB_PASSWORD"),
  JWT_SECRET: required("JWT_SECRET"),
  RESERVATION_TTL_MINUTES: requiredMinute("RESERVATION_TTL_MINUTES", 2880),
};
