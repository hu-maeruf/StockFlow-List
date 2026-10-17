import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPort(name, fallback) {
  const value = process.env[name] ?? fallback;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`${name} must be a whole number and between 1 and 65535`);
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
}