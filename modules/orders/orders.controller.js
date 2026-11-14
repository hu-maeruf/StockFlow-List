import reqBody from "../../utils/reqBody.js";
import AppError from "../../utils/AppError.js";
import { validatePostOrder, Validateidem } from "./orders.validation.js";
import { addOrder } from "./orders.service.js";

export const postOrders = async (req, res) => {
  try {
    const idempotency_key = Validateidem(req.headers);
    reqBody(req);
    const { customer_id, product_id, warehouse_id, quantity } = req.body;
    const input = validatePostOrder(
      customer_id,
      product_id,
      warehouse_id,
      quantity,
    );

    const order = await addOrder(
      input.customer_id,
      input.product_id,
      input.warehouse_id,
      input.quantity,
      idempotency_key,
      req.orgID,
      req.user.userID,
    );

    return res.status(201).json({
      order,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "Idempotency key conflict: This key was already used for a different request payload 1",
      });
    }

    console.error(error.message);
    return res.status(500).json({
      message: "Unexpected Error Occurred ",
    });
  }
};
