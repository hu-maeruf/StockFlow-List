import db from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import { env } from "../../config/env.js";

const MAX_TOTAL = 9999999999999.99;
export const addOrder = async (
  customer_id,
  product_id,
  warehouse_id,
  quantity,
  idempotency_key,
  orgId,
  userId,
) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const findExistingOrder = () =>
      client.query(
        "SELECT orders.order_id, orders.customer_id, orders.order_status, orders.total, order_items.product_id, order_items.warehouse_id, order_items.quantity, order_items.unit_price FROM orders JOIN order_items ON orders.order_id = order_items.order_id WHERE orders.organization_id = $1 AND orders.idempotency_key = $2 FOR UPDATE OF orders",
        [orgId, idempotency_key],
      );

    const returnExistingOrder = async (result) => {
      if (result.rowCount === 0) {
        throw new Error(
          "Idempotency conflict detected, but the existing order and item could not be loaded",
        );
      }

      const existingOrder = result.rows[0];
      if (
        existingOrder.customer_id !== customer_id ||
        existingOrder.product_id !== product_id ||
        existingOrder.warehouse_id !== warehouse_id ||
        existingOrder.quantity !== quantity
      ) {
        throw new AppError(
          409,
          "Idempotency key conflict: This key was already used for a different request payload",
        );
      }

      await client.query("COMMIT");
      return [
        {
          order_id: existingOrder.order_id,
          customer_id: existingOrder.customer_id,
          order_status: existingOrder.order_status,
          total: existingOrder.total,
          product_id: existingOrder.product_id,
          quantity: existingOrder.quantity,
          unit_price: existingOrder.unit_price,
        },
      ];
    };

    const existingOrder = await findExistingOrder();
    if (existingOrder.rowCount > 0) {
      return await returnExistingOrder(existingOrder);
    }

    const customer = await client.query(
      "SELECT customer_id FROM customers WHERE organization_id = $1 AND customer_id = $2",
      [orgId, customer_id],
    );

    if (customer.rowCount === 0) {
      throw new AppError(404, "Customer Not Found");
    }

    const product = await client.query(
      "SELECT product_id, price, product_status FROM products WHERE organization_id = $1 AND product_id = $2",
      [orgId, product_id],
    );

    if (product.rowCount === 0) {
      throw new AppError(404, "Product Not Found");
    }

    if (product.rows[0].product_status === "archived") {
      throw new AppError(409, "Product is archived");
    }

    const warehouse = await client.query(
      "SELECT warehouse_id FROM warehouses WHERE organization_id = $1 AND warehouse_id = $2",
      [orgId, warehouse_id],
    );

    if (warehouse.rowCount === 0) {
      throw new AppError(404, "Warehouse Not Found");
    }

    const inventory = await client.query(
      "SELECT inventory_id, quantity_on_hand, quantity_reserved FROM inventory WHERE organization_id = $1 AND product_id = $2 AND warehouse_id = $3 ORDER BY inventory_id FOR UPDATE",
      [orgId, product_id, warehouse_id],
    );

    if (inventory.rowCount === 0) {
      throw new AppError(404, "Inventory Not Found");
    }

    const available_quant =
      inventory.rows[0].quantity_on_hand - inventory.rows[0].quantity_reserved;

    if (available_quant < quantity) {
      throw new AppError(400, "Not enough qunatity");
    }

    const unit_price = product.rows[0].price;
    const total = quantity * unit_price;

    if (total > MAX_TOTAL) {
      throw new AppError(400, "Total amount is too high");
    }

    // ON CONFLICT handles the race where the lookup finds nothing, but another request inserts that key before this request reaches its own insert.

    const order = await client.query(
      "INSERT INTO orders (organization_id, customer_id, created_by, idempotency_key, total) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (organization_id, idempotency_key) DO NOTHING RETURNING order_id, customer_id, order_status, total",
      [orgId, customer_id, userId, idempotency_key, total],
    );

    if (order.rowCount === 0) {
      return await returnExistingOrder(await findExistingOrder());
    }

    const order_id = order.rows[0].order_id;

    await client.query(
      "INSERT INTO order_items (order_id, product_id, warehouse_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5) RETURNING product_id",
      [order_id, product_id, warehouse_id, quantity, unit_price],
    );

    order.rows[0]["product_id"] = product_id;
    order.rows[0]["quantity"] = quantity;
    order.rows[0]["unit_price"] = unit_price;

    await client.query("COMMIT");
    return order.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const reserveOrder = async (orgId, orderId) => {
  const client = await db.connect();
  try {
    client.query("BEGIN");
    const order = await client.query(
      "SELECT o.order_status, oi.quantity, oi.product_id, oi.warehouse_id FROM orders AS o JOIN order_items AS oi ON o.order_id = oi.order_id WHERE organization_id = $1 AND o.order_id = $2 FOR UPDATE OF o",
      [orgId, orderId],
    );

    if (order.rowCount === 0) {
      throw new AppError(404, "Order Not Found");
    }

    const { quantity, product_id, warehouse_id } = order.rows[0];

    if (order.rows[0].order_status !== "draft") {
      throw new AppError(400, "Couldn't reserve the order");
    }

    const { rows } = await client.query(
      "UPDATE orders SET order_status = $3, reservation_expires_at = now() + make_interval(mins => $4::int) WHERE organization_id = $1 AND order_id = $2 RETURNING order_status",
      [orgId, orderId, "reserved", env.RESERVATION_TTL_MINUTES],
    );

    const { order_status } = rows[0];

    const inventory = await client.query(
      "SELECT quantity_on_hand - quantity_reserved as quantity_available FROM inventory WHERE organization_id = $1 AND product_id = $2 AND warehouse_id = $3 FOR UPDATE",
      [orgId, product_id, warehouse_id],
    );

    if (inventory.rowCount === 0) {
      throw new AppError(404, "Inventory Not Found");
    }

    const { quantity_available } = inventory.rows[0];

    if (quantity_available < quantity) {
      throw new AppError(400, "Not enough qunatity");
    }

    await client.query(
      "UPDATE inventory SET quantity_reserved = quantity_reserved + $4 WHERE organization_id = $1 AND product_id = $2 AND warehouse_id = $3 AND quantity_on_hand - quantity_reserved >= $4",
      [orgId, product_id, warehouse_id, quantity],
    );

    await client.query(
      "INSERT INTO inventory_movements (organization_id, product_id, warehouse_id, tr_type, quantity) VALUES ($1, $2, $3, $4, $5)",
      [orgId, product_id, warehouse_id, "reservation", quantity],
    );

    await client.query("COMMIT");
    return [
      {
        orderId,
        warehouse_id,
        product_id,
        order_status,
        quantity,
      },
    ];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
