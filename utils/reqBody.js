import AppError from "./AppError.js";

export default function validateReqBody(req) {
  if (req.body === null || typeof req.body !== "object") {
    throw new AppError(400, "Request body must be a JSON object");
  }
}