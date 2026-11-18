import db from "../config/db.js";

const findExpiredOrders = async () => {
  const expirePassed = await db.query(
    "SELECT order_id, organization_id FROM orders WHERE order_status = 'reserved' AND reservation_expires_at < now()",
  );
  return expirePassed.rows;
};

const addExpiry = async ({ order_id, organization_id }) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const order_items = await client.query(
      "SELECT product_id, warehouse_id, quantity FROM order_items WHERE order_id = $1",
      [order_id],
    );

    if (order_items.rowCount === 0) {
      throw new Error(`Order ${order_id} is reserved but has no items`);
    }

    for (const item of order_items.rows) {
      const inven = await client.query(
        "UPDATE inventory SET quantity_reserved = quantity_reserved - $4, updated_at = now() WHERE organization_id = $1 AND product_id = $2 AND warehouse_id = $3 AND quantity_reserved >= $4 RETURNING quantity_reserved",
        [organization_id, item.product_id, item.warehouse_id, item.quantity],
      );

      if (inven.rowCount !== 1) {
        throw new Error(`release failed for item ${item.product_id}`);
      }

      await client.query(
        "INSERT INTO inventory_movements (organization_id, product_id, warehouse_id, tr_type, quantity, reference_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          organization_id,
          item.product_id,
          item.warehouse_id,
          "reservation_release",
          item.quantity,
          order_id,
        ],
      );
    }
    const orders = await client.query(
      "UPDATE orders SET order_status = $3 WHERE organization_id = $1 AND order_id = $2 AND order_status = $4",
      [organization_id, order_id, "reservation_expired", "reserved"],
    );

    if (orders.rowCount === 0) {
      await client.query("ROLLBACK");
      return;
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const checkExpire = () => {
  setInterval(async () => {
    try {
      const expired = await findExpiredOrders();
      for (const order of expired) {
        try {
          await addExpiry(order);
        } catch (e) {
          console.error(`Order ${order.order_id} failed:`, e.message);
        }
      }
    } catch (error) {
      console.error("Expiry tick failed:", error.message);
    }
  }, 60_000);
};
