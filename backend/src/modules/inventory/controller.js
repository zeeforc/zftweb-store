const db = require("../../config/database");

const InventoryController = {
  // -----------------------------------------------------------------
  // 1. Mengambil Semua Data Akun di Inventory
  // -----------------------------------------------------------------
  async getAll(req, reply) {
    try {
      const { rows } = await db.execute(`
        SELECT 
          i.*,
          pv.account_type,
          pv.duration,
          p.name as product_name
        FROM inventory i
        LEFT JOIN product_variants pv ON i.variant_id = pv.id
        LEFT JOIN products p ON pv.product_id = p.id
        ORDER BY i.created_at DESC
      `);

      // Format output agar mirip dengan response Supabase sebelumnya
      const result = rows.map((row) => ({
        id: row.id,
        variant_id: row.variant_id,
        email: row.email,
        password: row.password,
        profile_name: row.profile_name,
        pin: row.pin,
        status: row.status,
        created_at: row.created_at,
        product_variants: {
          account_type: row.account_type,
          duration: row.duration,
          products: { name: row.product_name },
        },
      }));

      return reply.code(200).send(result);
    } catch (err) {
      req.log.error("Error getAll inventory:", err);
      return reply.code(500).send({
        message: "Gagal mengambil data stok akun.",
        error: err.message,
      });
    }
  },

  // -----------------------------------------------------------------
  // 2. Menambah Stok Akun (Bulk)
  // -----------------------------------------------------------------
  async addStock(req, reply) {
    const { variant_id, accounts, status_web } = req.body;

    try {
      if (!variant_id || !accounts) {
        return reply
          .code(400)
          .send({ message: "Variant ID dan Data Akun wajib diisi." });
      }

      // Pecah string multi-baris jadi array
      const accountList = accounts
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");

      if (accountList.length === 0) {
        return reply.code(400).send({ message: "Format akun tidak valid." });
      }

      // Insert tiap akun ke inventory
      for (const accLine of accountList) {
        const parts = accLine.split("|");
        await db.execute({
          sql: `INSERT INTO inventory (variant_id, email, password, profile_name, pin, status)
                VALUES (?, ?, ?, ?, ?, 'available')`,
          args: [
            variant_id,
            parts[0] || "",
            parts[1] || "",
            parts[2] || null,
            parts[3] || null,
          ],
        });
      }

      // Update stock_count di product_variants
      const { rows } = await db.execute({
        sql: "SELECT stock_count FROM product_variants WHERE id = ?",
        args: [variant_id],
      });

      const currentStock = rows[0] ? rows[0].stock_count || 0 : 0;
      const newStockCount = currentStock + accountList.length;

      // Update stok & status visibilitas
      let updateSql = "UPDATE product_variants SET stock_count = ?";
      const updateArgs = [newStockCount];

      if (status_web === "ready") {
        updateSql += ", is_active = 1";
      } else if (status_web === "hidden") {
        updateSql += ", is_active = 0";
      }

      updateSql += " WHERE id = ?";
      updateArgs.push(variant_id);

      await db.execute({ sql: updateSql, args: updateArgs });

      return reply.code(201).send({
        status: "success",
        message: `${accountList.length} Akun berhasil ditambahkan!`,
      });
    } catch (err) {
      req.log.error("Error addStock:", err);
      return reply.code(500).send({
        message: "Gagal menyimpan stok akun.",
        error: err.message || err,
      });
    }
  },

  // -----------------------------------------------------------------
  // 3. Menghapus 1 Stok Akun
  // -----------------------------------------------------------------
  async delete(req, reply) {
    const { id } = req.params;

    try {
      // Cari variant_id sebelum hapus
      const { rows: invRows } = await db.execute({
        sql: "SELECT variant_id FROM inventory WHERE id = ?",
        args: [id],
      });

      if (!invRows || invRows.length === 0) {
        return reply
          .code(404)
          .send({ message: "Data stok akun tidak ditemukan." });
      }

      const variantId = invRows[0].variant_id;

      // Hapus dari inventory
      await db.execute({
        sql: "DELETE FROM inventory WHERE id = ?",
        args: [id],
      });

      // Kurangi stock_count
      const { rows: variantRows } = await db.execute({
        sql: "SELECT stock_count FROM product_variants WHERE id = ?",
        args: [variantId],
      });

      if (variantRows[0] && variantRows[0].stock_count > 0) {
        await db.execute({
          sql: "UPDATE product_variants SET stock_count = ? WHERE id = ?",
          args: [variantRows[0].stock_count - 1, variantId],
        });
      }

      return reply.code(200).send({
        status: "success",
        message: "Satu stok akun berhasil dihapus.",
      });
    } catch (err) {
      req.log.error("Error delete stock:", err);
      return reply.code(500).send({
        message: "Terjadi kesalahan saat menghapus stok.",
        error: err.message || err,
      });
    }
  },

  // -----------------------------------------------------------------
  // 4. Toggle Visibilitas Varian
  // -----------------------------------------------------------------
  async updateVariantStatus(req, reply) {
    const { id } = req.params;
    const { is_active } = req.body;

    try {
      await db.execute({
        sql: "UPDATE product_variants SET is_active = ? WHERE id = ?",
        args: [is_active ? 1 : 0, id],
      });

      return reply.code(200).send({
        status: "success",
        message: "Status visibilitas varian berhasil diupdate.",
      });
    } catch (err) {
      req.log.error("Error update status:", err);
      return reply
        .code(500)
        .send({ message: "Gagal merubah status.", error: err.message });
    }
  },
};

module.exports = InventoryController;
