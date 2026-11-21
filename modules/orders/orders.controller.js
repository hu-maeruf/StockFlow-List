import reqBody from "../../utils/reqBody.js";
import AppError from "../../utils/AppError.js";
import { validatePostOrder, Validateidem } from "./orders.validation.js";
import { addOrder, reserveOrder, confOrder } from "./orders.service.js";

export const postOrders = async (req, res) => {
  try {
    const idempotency_key = Validateidem(req.headers);
    reqBody(req);
    const input = req.body;
    const { customer_id, orders } = validatePostOrder(
      input.customer_id,
      input.items,
    );

    const order = await addOrder(
      req.orgID,
      req.user.userID,
      idempotency_key,
      customer_id,
      orders,
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
        message: "Duplicate product and warehouse in one order",
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred",
    });
  }
};

export const reserveOrderByID = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return res.status(404).json({
        message: "Order Not Found",
      });
    }
    const order = await reserveOrder(req.orgID, orderId);
    if (order.length === 0) {
      return res.status(404).json({
        message: "Order Not Found",
      });
    }
    return res.status(201).json({
      message: "Reserved",
      order,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred",
    });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return res.status(404).json({
        message: "Order Not Found",
      });
    }

    await confOrder(req.orgID, orderId);
    return res.status(201).json({
      message: `Order ${orderId} Confirmed Successfully`,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred",
    });
  }
};
