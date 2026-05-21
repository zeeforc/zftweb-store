const db = require("../../config/database");
const tripay = require("./tripay");

const OrderController = {
  // -----------------------------------------------------------------
  // 1. Checkout - Buat Order + Request Payment ke Tripay
  // -----------------------------------------------------------------
  async createOrder(request, reply) {
    try {
      const { user_email, user_name, items, payment_method } = request.body;

      // items = [{ variant_id, qty, price }]
      if (!user_email || !items || items.length === 0 || !payment_method) {
        return reply
          .code(400)
          .send({ message: "Data checkout tidak lengkap." });
      }

      // Hitung total
      let totalPrice = 0;
      const orderItems = [];

      for (const item of items) {
        // Ambil info varian dari DB
        const { rows } = await db.execute({
          sql: `SELECT pv.*, p.name as product_name 
                FROM product_variants pv 
                JOIN products p ON pv.product_id = p.id 
                WHERE pv.id = ?`,
          args: [item.variant_id],
        });

        if (!rows || rows.length === 0) {
          return reply
            .code(400)
            .send({ message: `Varian ID ${item.variant_id} tidak ditemukan.` });
        }

        const variant = rows[0];
        const itemTotal = variant.sell_price * item.qty;
        totalPrice += itemTotal;

        orderItems.push({
          sku: `VAR-${variant.id}`,
          name: `${variant.product_name} (${variant.account_type} - ${variant.duration})`,
          price: variant.sell_price,
          quantity: item.qty,
        });
      }

      // Generate merchant_ref unik
      const merchantRef = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Simpan order ke database dulu
      const { rows: orderRows } = await db.execute({
        sql: `INSERT INTO orders (user_email, variant_id, total_price, voucher_id, status)
              VALUES (?, ?, ?, ?, 'pending') RETURNING *`,
        args: [user_email, items[0].variant_id, totalPrice, merchantRef],
      });

      const newOrder = orderRows[0];

      // Simpan semua item order (kalau multi-item)
      for (const item of items) {
        if (item.variant_id !== items[0].variant_id) {
          // Untuk item tambahan, buat order terpisah yang linked via merchantRef
          await db.execute({
            sql: `INSERT INTO orders (user_email, variant_id, total_price, voucher_id, status)
                  VALUES (?, ?, ?, ?, 'pending')`,
            args: [user_email, item.variant_id, 0, merchantRef],
          });
        }
      }

      // Tentukan callback & return URL
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5500";

      // Request ke Tripay
      const tripayResponse = await tripay.createTransaction({
        method: payment_method,
        merchantRef: merchantRef,
        amount: totalPrice,
        customerName: user_name || "Customer",
        customerEmail: user_email,
        orderItems: orderItems,
        callbackUrl: `${baseUrl}/api/webhook/tripay`,
        returnUrl: `${frontendUrl}/index.html?order_success=${merchantRef}`,
      });

      if (!tripayResponse.success) {
        // Tripay error, hapus order
        await db.execute({
          sql: "DELETE FROM orders WHERE voucher_id = ?",
          args: [merchantRef],
        });
        return reply.code(400).send({
          message: "Gagal membuat transaksi pembayaran.",
          error: tripayResponse.message || tripayResponse,
        });
      }

      return reply.send({
        status: "success",
        message: "Order berhasil dibuat",
        order_id: newOrder.id,
        merchant_ref: merchantRef,
        total_price: totalPrice,
        payment: {
          reference: tripayResponse.data.reference,
          method: tripayResponse.data.payment_method,
          payment_name: tripayResponse.data.payment_name,
          amount: tripayResponse.data.amount,
          fee: tripayResponse.data.total_fee,
          amount_received: tripayResponse.data.amount_received,
          checkout_url: tripayResponse.data.checkout_url,
          pay_code: tripayResponse.data.pay_code,
          pay_url: tripayResponse.data.pay_url,
          qr_string: tripayResponse.data.qr_string,
          qr_url: tripayResponse.data.qr_url,
          expired_time: tripayResponse.data.expired_time,
        },
      });
    } catch (err) {
      request.log.error("Error createOrder:", err);
      return reply.code(500).send({ message: err.message });
    }
  },

  // -----------------------------------------------------------------
  // 2. Webhook Callback dari Tripay
  // -----------------------------------------------------------------
  async handleTripayWebhook(request, reply) {
    try {
      const rawBody = JSON.stringify(request.body);
      const callbackSignature = request.headers["x-callback-signature"] || "";

      // Validasi signature
      const isValid = tripay.verifyCallbackSignature(
        rawBody,
        callbackSignature,
      );
      if (!isValid) {
        return reply.code(403).send({ message: "Invalid signature" });
      }

      const data = request.body;
      const merchantRef = data.merchant_ref;
      const status = data.status;

      if (status === "PAID") {
        // Update semua order dengan merchant_ref ini jadi paid
        await db.execute({
          sql: "UPDATE orders SET status = 'paid' WHERE voucher_id = ?",
          args: [merchantRef],
        });

        // Ambil semua order yang terkait
        const { rows: orders } = await db.execute({
          sql: "SELECT * FROM orders WHERE voucher_id = ? AND variant_id IS NOT NULL",
          args: [merchantRef],
        });

        // Untuk setiap order, assign stok akun
        for (const order of orders) {
          // Ambil 1 stok available
          const { rows: stockRows } = await db.execute({
            sql: `SELECT * FROM inventory 
                  WHERE variant_id = ? AND status = 'available' 
                  LIMIT 1`,
            args: [order.variant_id],
          });

          if (stockRows && stockRows.length > 0) {
            const stock = stockRows[0];

            // Simpan ke delivered_items
            const accountDetails = JSON.stringify({
              email: stock.email,
              password: stock.password,
              profile_name: stock.profile_name,
              pin: stock.pin,
            });

            await db.execute({
              sql: `INSERT INTO delivered_items (order_id, account_details) VALUES (?, ?)`,
              args: [order.id, accountDetails],
            });

            // Update inventory jadi sold
            await db.execute({
              sql: "UPDATE inventory SET status = 'sold' WHERE id = ?",
              args: [stock.id],
            });

            // Kurangi stock_count di variant
            await db.execute({
              sql: "UPDATE product_variants SET stock_count = stock_count - 1 WHERE id = ? AND stock_count > 0",
              args: [order.variant_id],
            });
          }
        }

        // Catat cash_flow
        const mainOrder = orders.find((o) => o.total_price > 0);
        if (mainOrder) {
          await db.execute({
            sql: `INSERT INTO cash_flow (order_id, entry_type, amount, source) VALUES (?, 'income', ?, 'Tripay')`,
            args: [mainOrder.id, mainOrder.total_price],
          });
        }
      } else if (status === "EXPIRED" || status === "FAILED") {
        await db.execute({
          sql: "UPDATE orders SET status = ? WHERE voucher_id = ?",
          args: [status.toLowerCase(), merchantRef],
        });
      }

      return reply.send({ success: true });
    } catch (err) {
      request.log.error("Error Tripay webhook:", err);
      return reply.code(500).send({ message: err.message });
    }
  },

  // -----------------------------------------------------------------
  // 3. Cek Status Order (Polling dari frontend)
  // -----------------------------------------------------------------
  async checkOrderStatus(request, reply) {
    try {
      const { merchant_ref } = request.query;

      if (!merchant_ref) {
        return reply.code(400).send({ message: "merchant_ref diperlukan." });
      }

      const { rows } = await db.execute({
        sql: `SELECT o.*, di.account_details, di.delivered_at,
                     pv.account_type, pv.duration, p.name as product_name, p.thumbnail_url
              FROM orders o
              LEFT JOIN delivered_items di ON o.id = di.order_id
              LEFT JOIN product_variants pv ON o.variant_id = pv.id
              LEFT JOIN products p ON pv.product_id = p.id
              WHERE o.voucher_id = ?
              ORDER BY o.total_price DESC`,
        args: [merchant_ref],
      });

      if (!rows || rows.length === 0) {
        return reply.code(404).send({ message: "Order tidak ditemukan." });
      }

      const mainOrder = rows[0];
      const deliveredItems = rows
        .filter((r) => r.account_details)
        .map((r) => ({
          product_name: r.product_name,
          thumbnail_url: r.thumbnail_url,
          account_type: r.account_type,
          duration: r.duration,
          account_details: JSON.parse(r.account_details),
          delivered_at: r.delivered_at,
        }));

      return reply.send({
        status: mainOrder.status,
        merchant_ref: merchant_ref,
        total_price: mainOrder.total_price,
        user_email: mainOrder.user_email,
        created_at: mainOrder.created_at,
        delivered_items: deliveredItems,
      });
    } catch (err) {
      return reply.code(500).send({ message: err.message });
    }
  },

  // -----------------------------------------------------------------
  // 4. Get My Items (Riwayat akun user di profile)
  // -----------------------------------------------------------------
  async getMyItems(request, reply) {
    try {
      const { email } = request.query;

      if (!email) {
        return reply.code(400).send({ message: "Email diperlukan." });
      }

      const { rows } = await db.execute({
        sql: `SELECT 
                o.id, o.total_price, o.created_at, o.voucher_id as merchant_ref, o.status,
                di.account_details, di.delivered_at,
                pv.account_type, pv.duration,
                p.name as product_name, p.thumbnail_url
              FROM orders o
              LEFT JOIN delivered_items di ON o.id = di.order_id
              LEFT JOIN product_variants pv ON o.variant_id = pv.id
              LEFT JOIN products p ON pv.product_id = p.id
              WHERE o.user_email = ? AND o.status = 'paid' AND o.total_price > 0
              ORDER BY o.created_at DESC`,
        args: [email],
      });

      const result = rows.map((row) => ({
        id: row.id,
        merchant_ref: row.merchant_ref,
        product_name: row.product_name,
        thumbnail_url: row.thumbnail_url,
        account_type: row.account_type,
        duration: row.duration,
        total_price: row.total_price,
        created_at: row.created_at,
        status: row.status,
        account_details: row.account_details
          ? JSON.parse(row.account_details)
          : null,
        delivered_at: row.delivered_at,
      }));

      return reply.send(result);
    } catch (err) {
      return reply.code(500).send({ message: err.message });
    }
  },
};

module.exports = OrderController;
