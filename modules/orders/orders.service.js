import db from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import { env } from "../../config/env.js";

const MAX_TOTAL = 9999999999999.99;

function extractId(item) {
  const cont = [];
  for (let i = 0; i < item.length; i++) {
    cont.push(`$${i + 1}`);
  }
  return cont;
}

function extractKey(item, key) {
  const cont = [];
  for (const elem of item) {
    cont.push(elem[key]);
  }
  return cont;
}

async function checkProduct(client, orgId, items) {
  const nums = extractId(items);
  const values = extractKey(items, "product_id");
  values.push(orgId);
  const product = await client.query(
    `SELECT product_id, price, product_status FROM products WHERE organization_id = $${values.length} AND product_id IN (${nums.join(", ")})`,
    values,
  );

  const missingProducts = items.filter(
    (item) => !product.rows.some((elem) => elem.product_id === item.product_id),
  );
  if (missingProducts.length > 0) {
    throw new AppError(404, "Product Not Found");
  }

  for (const item of product.rows) {
    if (item.product_status === "archived") {
      throw new AppError(409, `Product ${item.product_id} is archived`);
    }
  }
  return product;
}

async function checkWarehouse(client, orgId, items) {
  const nums = extractId(items);
  const values = extractKey(items, "warehouse_id");
  values.push(orgId);
  const warehouse = await client.query(
    `SELECT warehouse_id FROM warehouses WHERE organization_id = $${values.length} AND warehouse_id IN (${nums.join(", ")})`,
    values,
  );

  const missingWarehouse = items.filter(
    (item) =>
      !warehouse.rows.some((elem) => elem.warehouse_id === item.warehouse_id),
  );
  if (missingWarehouse.length > 0) {
    throw new AppError(404, "Warehouse Not Found");
  }

  return warehouse;
}

async function checkInventory(client, orgId, items, product) {
  const container = [];
  const values = [];
  let total = 0;
  for (const [i, item] of items.entries()) {
    container.push(
      `(product_id = $${2 * i + 1} AND warehouse_id = $${2 * i + 2})`,
    );
    values.push(item.product_id, item.warehouse_id);
  }
  values.push(orgId);
  const inventory = await client.query(
    `SELECT inventory_id, quantity_on_hand, quantity_reserved, product_id, warehouse_id FROM inventory WHERE organization_id = $${2 * container.length + 1} AND ${container.join(" OR ")} ORDER BY inventory_id FOR UPDATE`,
    values,
  );

  const missingInventory = items.filter(
    (item) =>
      !inventory.rows.some(
        (elem) =>
          elem.warehouse_id === item.warehouse_id &&
          elem.product_id === item.product_id,
      ),
  );
  if (missingInventory.length > 0) {
    throw new AppError(404, "Inventory Not Found");
  }

  for (const inv of inventory.rows) {
    const available_quant = inv.quantity_on_hand - inv.quantity_reserved;

    const temp = items.find(
      (item) =>
        item.product_id === inv.product_id &&
        item.warehouse_id === inv.warehouse_id,
    );

    if (temp.length === 0) {
      throw new AppError(400, "Inventory Not Found");
    }

    if (available_quant < temp.quantity) {
      throw new AppError(400, "Not enough qunatity");
    }

    const product_info = product.rows.find(
      (item) => item.product_id === inv.product_id,
    );
    total += temp.quantity * product_info.price;

    if (total > MAX_TOTAL) {
      throw new AppError(400, "Total amount is too high");
    }
  }

  return { inventory, total };
}

function prepareOrderItem(order, input, inventory, product) {
  const order_id = order.rows[0].order_id;
  const values = [];
  const placeholder = [];

  for (const item of input) {
    const { product_id, warehouse_id, quantity } = item;
    const temp = inventory.rows.find(
      (elem) =>
        elem.product_id === product_id && elem.warehouse_id === warehouse_id,
    );
    const { price } = product.rows.find(
      (elem) => temp.product_id === elem.product_id,
    );
    values.push(order_id, product_id, warehouse_id, quantity, price);
    placeholder.push(
      `($${values.length - 4}`,
      `$${values.length - 3}`,
      `$${values.length - 2}`,
      `$${values.length - 1}`,
      `$${values.length})`,
    );
  }
  return { values, placeholder };
}

export const addOrder = async (
  orgId,
  userId,
  idempotency_key,
  customer_id,
  input,
) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const findExistingOrder = () =>
      client.query(
        "SELECT orders.order_id, orders.customer_id, orders.order_status, orders.total, order_items.product_id, order_items.warehouse_id, order_items.quantity, order_items.unit_price FROM orders JOIN order_items ON orders.order_id = order_items.order_id WHERE orders.organization_id = $1 AND orders.idempotency_key = $2 ORDER BY order_items.product_id FOR UPDATE OF orders",
        [orgId, idempotency_key],
      );

    const returnExistingOrder = async (result, customer_id) => {
      // ON CONFLICT handles the race where the lookup finds nothing, but another request inserts that key before this request reaches its own insert.
      if (result.rowCount === 0) {
        throw new Error(
          "Idempotency conflict detected, but the existing order and item could not be loaded",
        );
      }

      const existingOrder = result.rows;

      if (existingOrder.length === 0) {
        throw new Error(
          "Idempotency conflict detected, but the existing order and items could not be loaded",
        );
      }

      const hasConflict =
        existingOrder[0].customer_id !== customer_id ||
        existingOrder.length !== input.length;

      const requestedItems = new Map(
        input.map((item) => [
          `${item.product_id}:${item.warehouse_id}`,
          item.quantity,
        ]),
      );

      // Duplicate input lines can't match the order_items uniqueness constraint.
      if (requestedItems.size !== input.length) {
        throw new AppError(
          409,
          "Idempotency key conflict: different request payload",
        );
      }

      for (const item of existingOrder) {
        const key = `${item.product_id}:${item.warehouse_id}`;

        if (
          !requestedItems.has(key) ||
          requestedItems.get(key) !== item.quantity
        ) {
          throw new AppError(
            409,
            "Idempotency key conflict: different request payload",
          );
        }
        requestedItems.delete(key);
      }

      if (hasConflict || requestedItems.size > 0) {
        throw new AppError(
          409,
          "Idempotency key conflict: different request payload",
        );
      }

      await client.query("COMMIT");
      return [
        {
          order_id: existingOrder[0].order_id,
          customer_id: existingOrder[0].customer_id,
          order_status: existingOrder[0].order_status,
          total: existingOrder[0].total,
        },
      ];
    };

    const existingOrder = await findExistingOrder();
    if (existingOrder.rowCount > 0) {
      return await returnExistingOrder(existingOrder, customer_id);
    }

    const customer = await client.query(
      "SELECT customer_id FROM customers WHERE organization_id = $1 AND customer_id = $2",
      [orgId, customer_id],
    );

    if (customer.rowCount === 0) {
      throw new AppError(404, "Customer Not Found");
    }

    const product = await checkProduct(client, orgId, input);
    const warehouse = await checkWarehouse(client, orgId, input);
    const { inventory, total } = await checkInventory(
      client,
      orgId,
      input,
      product,
    );

    // ON CONFLICT handles the race where the lookup finds nothing, but another request inserts that key before this request reaches its own insert.
    const order = await client.query(
      "INSERT INTO orders (organization_id, customer_id, created_by, idempotency_key, total) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (organization_id, idempotency_key) DO NOTHING RETURNING order_id, customer_id, order_status, total",
      [orgId, customer_id, userId, idempotency_key, total],
    );

    if (order.rowCount === 0) {
      return await returnExistingOrder(await findExistingOrder());
    }

    const { values, placeholder } = prepareOrderItem(
      order,
      input,
      inventory,
      product,
    );

    await client.query(
      `INSERT INTO order_items (order_id, product_id, warehouse_id, quantity, unit_price) VALUES ${placeholder.join(", ")}`,
      values,
    );

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
    await client.query("BEGIN");
    const order = await client.query(
      "SELECT order_status FROM orders WHERE organization_id = $1 AND order_id = $2 FOR UPDATE",
      [orgId, orderId],
    );

    if (order.rowCount === 0) {
      throw new AppError(404, "Order Not Found");
    }

    if (order.rows[0].order_status !== "draft") {
      throw new AppError(400, "Couldn't reserve the order");
    }

    const orderItems = await client.query(
      "SELECT product_id, warehouse_id, quantity FROM order_items WHERE order_id = $1 ORDER BY product_id, warehouse_id",
      [orderId],
    );

    if (orderItems.rowCount === 0) {
      throw new AppError(400, "Order has no items to reserve");
    }

    const inventoryConditions = [];
    const inventoryValues = [];
    for (const [index, item] of orderItems.rows.entries()) {
      inventoryConditions.push(
        `(product_id = $${2 * index + 1} AND warehouse_id = $${2 * index + 2})`,
      );
      inventoryValues.push(item.product_id, item.warehouse_id);
    }
    inventoryValues.push(orgId);

    const inventory = await client.query(
      `SELECT product_id, warehouse_id, quantity_on_hand, quantity_reserved FROM inventory WHERE (${inventoryConditions.join(" OR ")}) AND organization_id = $${inventoryValues.length} ORDER BY warehouse_id ASC, inventory_id ASC FOR UPDATE`,
      inventoryValues,
    );

    const inventoryByItem = new Map(
      inventory.rows.map((item) => [
        `${item.product_id}:${item.warehouse_id}`,
        item,
      ]),
    );
    const missingInventory = orderItems.rows.filter(
      (item) => !inventoryByItem.has(`${item.product_id}:${item.warehouse_id}`),
    );
    if (missingInventory.length > 0) {
      throw new AppError(404, "Inventory Not Found");
    }

    for (const item of orderItems.rows) {
      const stock = inventoryByItem.get(
        `${item.product_id}:${item.warehouse_id}`,
      );
      const quantityAvailable =
        stock.quantity_on_hand - stock.quantity_reserved;
      if (quantityAvailable < item.quantity) {
        throw new AppError(
          400,
          `Not enough quantity for product ${item.product_id} in warehouse ${item.warehouse_id}`,
        );
      }
    }

    for (const item of orderItems.rows) {
      const updatedInventory = await client.query(
        "UPDATE inventory SET quantity_reserved = quantity_reserved + $4 WHERE organization_id = $1 AND product_id = $2 AND warehouse_id = $3 AND quantity_on_hand - quantity_reserved >= $4",
        [orgId, item.product_id, item.warehouse_id, item.quantity],
      );
      if (updatedInventory.rowCount !== 1) {
        throw new AppError(400, "Not enough quantity");
      }

      await client.query(
        "INSERT INTO inventory_movements (organization_id, product_id, warehouse_id, tr_type, quantity, reference_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          orgId,
          item.product_id,
          item.warehouse_id,
          "reservation",
          item.quantity,
          orderId,
        ],
      );
    }

    const updatedOrder = await client.query(
      "UPDATE orders SET order_status = $3, reservation_expires_at = now() + make_interval(mins => $4::int) WHERE organization_id = $1 AND order_id = $2 AND order_status = 'draft' RETURNING order_status",
      [orgId, orderId, "reserved", env.RESERVATION_TTL_MINUTES],
    );
    if (updatedOrder.rowCount !== 1) {
      throw new AppError(400, "Couldn't reserve the order");
    }

    await client.query("COMMIT");
    return orderItems.rows.map((item) => ({
      orderId,
      warehouse_id: item.warehouse_id,
      product_id: item.product_id,
      order_status: updatedOrder.rows[0].order_status,
      quantity: item.quantity,
    }));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const confOrder = async (orgId, order_id) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const order = await client.query(
      "SELECT order_status FROM orders WHERE organization_id = $1 AND order_id = $2 FOR UPDATE",
      [orgId, order_id],
    );

    if (order.rowCount === 0) {
      throw new AppError(404, "Order Not Found");
    }

    if (order.rows[0].order_status !== "reserved") {
      throw new AppError(
        409,
        `Order is ${order.rows[0].order_status}, not confirmable`,
      );
    }
    const updated = await client.query(
      "UPDATE orders SET order_status = $3 WHERE organization_id = $1 AND order_id = $2 AND order_status = 'reserved' AND reservation_expires_at > now()",
      [orgId, order_id, "confirmed"],
    );

    if (updated.rowCount === 0) {
      throw new AppError(409, "Reservation has expired");
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const cancelOrder = async (orgId, orderId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const order = await client.query(
      "SELECT order_status FROM orders WHERE organization_id = $1 AND order_id = $2 FOR UPDATE",
      [orgId, orderId],
    );

    if (order.rowCount === 0) {
      throw new AppError(404, "Order Not Found");
    }

    if (
      order.rows[0].order_status === "fulfilled" ||
      order.rows[0].order_status === "reservation_expired" ||
      order.rows[0].order_status === "cancelled"
    ) {
      throw new AppError(400, "Couldn't cancel the order");
    }

    const orderItems = await client.query(
      "SELECT product_id, warehouse_id, quantity FROM order_items WHERE order_id = $1 ORDER BY product_id, warehouse_id",
      [orderId],
    );

    if (orderItems.rowCount === 0) {
      throw new AppError(400, "Order has no items to cancel");
    }

    async function updateOrder(org_id, order_id, status) {
      const updatedOrder = await client.query(
        "UPDATE orders SET order_status = $3 WHERE organization_id = $1 AND order_id = $2 AND order_status = $4 RETURNING order_status",
        [org_id, order_id, "cancelled", status],
      );
      return updatedOrder;
    }

    let updatedOrder;
    if (order.rows[0].order_status === "draft") {
      updatedOrder = await updateOrder(orgId, orderId, "draft");
      if (updatedOrder.rowCount !== 1) {
        throw new AppError(400, "Couldn't cancel the order");
      }
      await client.query("COMMIT");
      return orderItems.rows.map((item) => ({
        orderId,
        warehouse_id: item.warehouse_id,
        product_id: item.product_id,
        order_status: updatedOrder.rows[0].order_status,
        quantity: item.quantity,
      }));
    }

    const inventory = await client.query(
      "SELECT i.inventory_id, i.product_id, i.warehouse_id, i.quantity_reserved, oi.quantity FROM inventory AS i JOIN order_items AS oi ON oi.product_id = i.product_id AND oi.warehouse_id = i.warehouse_id WHERE i.organization_id = $1 AND oi.order_id = $2 ORDER BY i.warehouse_id ASC, i.inventory_id ASC FOR UPDATE OF i",
      [orgId, orderId],
    );

    if (inventory.rowCount !== orderItems.rowCount) {
      throw new AppError(404, "Inventory Not Found");
    }

    for (const item of inventory.rows) {
      if (item.quantity_reserved < item.quantity) {
        throw new AppError(
          400,
          `Not enough quantity for product ${item.product_id} in warehouse ${item.warehouse_id}`,
        );
      }
    }

    for (const item of inventory.rows) {
      const updatedInventory = await client.query(
        "UPDATE inventory SET quantity_reserved = quantity_reserved - $3, updated_at = now() WHERE organization_id = $1 AND inventory_id = $2 AND quantity_reserved >= $3",
        [orgId, item.inventory_id, item.quantity],
      );
      if (updatedInventory.rowCount !== 1) {
        throw new AppError(400, "Not enough quantity");
      }

      await client.query(
        "INSERT INTO inventory_movements (organization_id, product_id, warehouse_id, tr_type, quantity, reference_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          orgId,
          item.product_id,
          item.warehouse_id,
          "reservation_release",
          item.quantity,
          orderId,
        ],
      );
    }

    if (order.rows[0].order_status === "reserved") {
      updatedOrder = await updateOrder(orgId, orderId, "reserved");
    } else if (order.rows[0].order_status === "confirmed") {
      updatedOrder = await updateOrder(orgId, orderId, "confirmed");
    }

    if (updatedOrder.rowCount !== 1) {
      throw new AppError(400, "Couldn't cancel the order");
    }

    await client.query("COMMIT");
    return orderItems.rows.map((item) => ({
      orderId,
      warehouse_id: item.warehouse_id,
      product_id: item.product_id,
      order_status: updatedOrder.rows[0].order_status,
      quantity: item.quantity,
    }));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
