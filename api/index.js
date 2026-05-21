// Vercel Serverless Function for ZFTStoree
// Using Turso HTTP API directly (no native deps needed)

const TURSO_URL = process.env.TURSO_DATABASE_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";

// Convert libsql:// URL to https:// for HTTP API
function getHttpUrl() {
  let url = TURSO_URL;
  if (url.startsWith("libsql://")) {
    url = url.replace("libsql://", "https://");
  }
  return url;
}

// Execute SQL via Turso HTTP API
async function executeSQL(sql, args = []) {
  const httpUrl = getHttpUrl();
  const response = await fetch(`${httpUrl}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          type: "execute",
          stmt: {
            sql,
            args: args.map((a) => ({
              type:
                a === null
                  ? "null"
                  : typeof a === "number"
                    ? Number.isInteger(a)
                      ? "integer"
                      : "float"
                    : "text",
              value: a === null ? null : String(a),
            })),
          },
        },
        { type: "close" },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Turso HTTP error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const result = data.results[0];

  if (result.type === "error") {
    throw new Error(result.error.message);
  }

  // Convert Turso response to rows format
  const cols = result.response.result.cols.map((c) => c.name);
  const rows = result.response.result.rows.map((row) => {
    const obj = {};
    row.forEach((cell, i) => {
      obj[cols[i]] = cell.value;
    });
    return obj;
  });

  return { rows };
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Callback-Signature",
  );

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const query = Object.fromEntries(url.searchParams);

  let body = null;
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString("utf8");
    try {
      body = JSON.parse(raw);
    } catch (e) {
      body = raw;
    }
  }

  try {
    // GET /api/products
    if (path === "/api/products" && req.method === "GET") {
      const { rows: products } = await executeSQL(
        "SELECT * FROM products ORDER BY created_at DESC",
      );
      const { rows: variants } = await executeSQL(
        "SELECT * FROM product_variants",
      );
      const result = products.map((p) => ({
        ...p,
        product_variants: variants.filter(
          (v) => String(v.product_id) === String(p.id),
        ),
      }));
      return res.end(JSON.stringify(result));
    }

    // POST /api/admin/products
    if (path === "/api/admin/products" && req.method === "POST") {
      const {
        name,
        category,
        description,
        short_description,
        image_url,
        variants: vars,
      } = body;
      if (!name) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "Nama produk wajib diisi." }));
      }
      const { rows } = await executeSQL(
        "INSERT INTO products (name, category, thumbnail_url, short_description, long_description, is_active) VALUES (?, ?, ?, ?, ?, 1) RETURNING *",
        [
          name,
          category || "Streaming",
          image_url || null,
          short_description || null,
          description || null,
        ],
      );
      const newProduct = rows[0];
      if (vars && Array.isArray(vars) && vars.length > 0) {
        for (const v of vars) {
          await executeSQL(
            "INSERT INTO product_variants (product_id, account_type, duration, cost_price, sell_price, is_active) VALUES (?, ?, ?, ?, ?, 1)",
            [
              newProduct.id,
              v.type,
              v.dur,
              Number(v.cost_price) || 0,
              Number(v.price) || 0,
            ],
          );
        }
      }
      res.statusCode = 201;
      return res.end(
        JSON.stringify({
          status: "success",
          message: "Produk berhasil disimpan!",
          data: newProduct,
        }),
      );
    }

    // PUT /api/admin/products/:id
    const putMatch = path.match(/^\/api\/admin\/products\/(\d+)$/);
    if (putMatch && req.method === "PUT") {
      const id = putMatch[1];
      const {
        name,
        category,
        description,
        short_description,
        image_url,
        variants: vars,
      } = body;
      await executeSQL(
        "UPDATE products SET name=?, category=?, thumbnail_url=?, short_description=?, long_description=?, updated_at=datetime('now') WHERE id=?",
        [name, category, image_url, short_description, description, id],
      );
      if (vars && Array.isArray(vars)) {
        await executeSQL("DELETE FROM product_variants WHERE product_id=?", [
          id,
        ]);
        for (const v of vars) {
          await executeSQL(
            "INSERT INTO product_variants (product_id, account_type, duration, cost_price, sell_price, is_active) VALUES (?,?,?,?,?,1)",
            [
              id,
              v.type,
              v.dur,
              Number(v.cost_price) || 0,
              Number(v.price) || 0,
            ],
          );
        }
      }
      return res.end(
        JSON.stringify({ status: "success", message: "Produk diperbarui!" }),
      );
    }

    // DELETE /api/admin/products/:id
    const delMatch = path.match(/^\/api\/admin\/products\/(\d+)$/);
    if (delMatch && req.method === "DELETE") {
      const id = delMatch[1];
      await executeSQL("DELETE FROM product_variants WHERE product_id=?", [id]);
      await executeSQL("DELETE FROM products WHERE id=?", [id]);
      return res.end(
        JSON.stringify({ status: "success", message: "Produk dihapus." }),
      );
    }

    // GET /api/admin/inventory
    if (path === "/api/admin/inventory" && req.method === "GET") {
      const { rows } = await executeSQL(
        "SELECT i.*, pv.account_type, pv.duration, p.name as product_name FROM inventory i LEFT JOIN product_variants pv ON i.variant_id=pv.id LEFT JOIN products p ON pv.product_id=p.id ORDER BY i.created_at DESC",
      );
      const result = rows.map((r) => ({
        id: r.id,
        variant_id: r.variant_id,
        email: r.email,
        password: r.password,
        profile_name: r.profile_name,
        pin: r.pin,
        status: r.status,
        created_at: r.created_at,
        product_variants: {
          account_type: r.account_type,
          duration: r.duration,
          products: { name: r.product_name },
        },
      }));
      return res.end(JSON.stringify(result));
    }

    // POST /api/admin/inventory
    if (path === "/api/admin/inventory" && req.method === "POST") {
      const { variant_id, accounts, status_web } = body;
      if (!variant_id || !accounts) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ message: "Variant ID dan Data Akun wajib diisi." }),
        );
      }
      const accountList = accounts
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "");
      for (const accLine of accountList) {
        const parts = accLine.split("|");
        await executeSQL(
          "INSERT INTO inventory (variant_id, email, password, profile_name, pin, status) VALUES (?,?,?,?,?,'available')",
          [
            variant_id,
            parts[0] || "",
            parts[1] || "",
            parts[2] || null,
            parts[3] || null,
          ],
        );
      }
      const { rows } = await executeSQL(
        "SELECT stock_count FROM product_variants WHERE id=?",
        [variant_id],
      );
      const newCount = (Number(rows[0]?.stock_count) || 0) + accountList.length;
      if (status_web === "ready") {
        await executeSQL(
          "UPDATE product_variants SET stock_count=?, is_active=1 WHERE id=?",
          [newCount, variant_id],
        );
      } else if (status_web === "hidden") {
        await executeSQL(
          "UPDATE product_variants SET stock_count=?, is_active=0 WHERE id=?",
          [newCount, variant_id],
        );
      } else {
        await executeSQL(
          "UPDATE product_variants SET stock_count=? WHERE id=?",
          [newCount, variant_id],
        );
      }
      res.statusCode = 201;
      return res.end(
        JSON.stringify({
          status: "success",
          message: `${accountList.length} Akun ditambahkan!`,
        }),
      );
    }

    // PATCH /api/admin/variants/:id/status
    const patchMatch = path.match(/^\/api\/admin\/variants\/(\d+)\/status$/);
    if (patchMatch && req.method === "PATCH") {
      const id = patchMatch[1];
      const { is_active } = body;
      await executeSQL("UPDATE product_variants SET is_active=? WHERE id=?", [
        is_active ? 1 : 0,
        id,
      ]);
      return res.end(
        JSON.stringify({ status: "success", message: "Status diupdate." }),
      );
    }

    // POST /api/checkout
    if (path === "/api/checkout" && req.method === "POST") {
      const { user_email, user_name, items, payment_method } = body;
      if (!user_email || !items || items.length === 0 || !payment_method) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ message: "Data checkout tidak lengkap." }),
        );
      }
      let totalPrice = 0;
      for (const item of items) {
        totalPrice += item.price * item.qty;
      }
      const merchantRef =
        "TRX-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 7).toUpperCase();
      const { rows } = await executeSQL(
        "INSERT INTO orders (user_email, variant_id, total_price, voucher_id, status) VALUES (?,?,?,?,'pending') RETURNING *",
        [user_email, items[0].variant_id, totalPrice, merchantRef],
      );
      return res.end(
        JSON.stringify({
          status: "success",
          order_id: rows[0].id,
          merchant_ref: merchantRef,
          total_price: totalPrice,
          payment: {
            checkout_url: null,
            qr_url: null,
            payment_name: payment_method,
            amount: totalPrice,
            reference: merchantRef,
            expired_time: Math.floor(Date.now() / 1000) + 86400,
          },
        }),
      );
    }

    // GET /api/orders/status
    if (path === "/api/orders/status" && req.method === "GET") {
      const merchant_ref = query.merchant_ref;
      if (!merchant_ref) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "merchant_ref diperlukan." }));
      }
      const { rows } = await executeSQL(
        "SELECT o.*, di.account_details, di.delivered_at, pv.account_type, pv.duration, p.name as product_name, p.thumbnail_url FROM orders o LEFT JOIN delivered_items di ON o.id=di.order_id LEFT JOIN product_variants pv ON o.variant_id=pv.id LEFT JOIN products p ON pv.product_id=p.id WHERE o.voucher_id=? ORDER BY o.total_price DESC",
        [merchant_ref],
      );
      if (!rows || rows.length === 0) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: "Order tidak ditemukan." }));
      }
      return res.end(
        JSON.stringify({
          status: rows[0].status,
          merchant_ref,
          total_price: rows[0].total_price,
        }),
      );
    }

    // GET /api/orders/my-items
    if (path === "/api/orders/my-items" && req.method === "GET") {
      const email = query.email;
      if (!email) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "Email diperlukan." }));
      }
      const { rows } = await executeSQL(
        "SELECT o.id, o.total_price, o.created_at, o.voucher_id as merchant_ref, di.account_details, di.delivered_at, pv.account_type, pv.duration, p.name as product_name, p.thumbnail_url FROM orders o LEFT JOIN delivered_items di ON o.id=di.order_id LEFT JOIN product_variants pv ON o.variant_id=pv.id LEFT JOIN products p ON pv.product_id=p.id WHERE o.user_email=? AND o.status='paid' AND o.total_price > 0 ORDER BY o.created_at DESC",
        [email],
      );
      const result = rows.map((r) => ({
        id: r.id,
        merchant_ref: r.merchant_ref,
        product_name: r.product_name,
        thumbnail_url: r.thumbnail_url,
        account_type: r.account_type,
        duration: r.duration,
        total_price: r.total_price,
        created_at: r.created_at,
        account_details: r.account_details
          ? JSON.parse(r.account_details)
          : null,
        delivered_at: r.delivered_at,
      }));
      return res.end(JSON.stringify(result));
    }

    // POST /api/webhook/tripay
    if (path === "/api/webhook/tripay" && req.method === "POST") {
      const crypto = require("crypto");
      const rawBody = JSON.stringify(body);
      const callbackSignature = req.headers["x-callback-signature"] || "";
      const privateKey = process.env.TRIPAY_PRIVATE_KEY || "";
      const signature = crypto
        .createHmac("sha256", privateKey)
        .update(rawBody)
        .digest("hex");
      if (signature !== callbackSignature) {
        res.statusCode = 403;
        return res.end(JSON.stringify({ message: "Invalid signature" }));
      }
      const { merchant_ref, status } = body;
      if (status === "PAID") {
        await executeSQL("UPDATE orders SET status='paid' WHERE voucher_id=?", [
          merchant_ref,
        ]);
        const { rows: orders } = await executeSQL(
          "SELECT * FROM orders WHERE voucher_id=?",
          [merchant_ref],
        );
        for (const order of orders) {
          const { rows: stock } = await executeSQL(
            "SELECT * FROM inventory WHERE variant_id=? AND status='available' LIMIT 1",
            [order.variant_id],
          );
          if (stock && stock.length > 0) {
            const s = stock[0];
            await executeSQL(
              "INSERT INTO delivered_items (order_id, account_details) VALUES (?,?)",
              [
                order.id,
                JSON.stringify({
                  email: s.email,
                  password: s.password,
                  profile_name: s.profile_name,
                  pin: s.pin,
                }),
              ],
            );
            await executeSQL("UPDATE inventory SET status='sold' WHERE id=?", [
              s.id,
            ]);
            await executeSQL(
              "UPDATE product_variants SET stock_count=stock_count-1 WHERE id=? AND stock_count>0",
              [order.variant_id],
            );
          }
        }
      } else if (status === "EXPIRED" || status === "FAILED") {
        await executeSQL("UPDATE orders SET status=? WHERE voucher_id=?", [
          status.toLowerCase(),
          merchant_ref,
        ]);
      }
      return res.end(JSON.stringify({ success: true }));
    }

    // 404
    res.statusCode = 404;
    return res.end(JSON.stringify({ message: "Route not found", path }));
  } catch (err) {
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ message: "Internal server error", error: err.message }),
    );
  }
};
