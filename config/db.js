import { Pool } from "pg";
import { env } from "./env.js";

const db = new Pool(
  {
    user: env.DB_USER,
    host: env.DB_HOST,
    database: env.DB_NAME,
    port: env.DB_PORT,
    password: env.DB_PASSWORD,
    max: 10,
  }
);

export default {
  query: (text, param) => db.query(text, param),
  connect: () => db.connect()
};