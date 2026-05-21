const db = require("../../config/database");

const ProductController = {
  // -----------------------------------------------------------------
  // Mengambil Semua Produk (beserta Varian)
  // -----------------------------------------------------------------
  async getAll(req, reply) {
    try {
      // Ambil semua produk
      const { rows: products } = await db.execute(
        "SELECT * FROM products ORDER BY created_at DESC",
      );

      // Ambil semua varian
      const { rows: variants } = await db.execute(
        "SELECT * FROM product_variants",
      );

      // Gabungkan varian ke produk masing-masing
      const result = products.map((product) => ({
        ...product,
        product_variants: variants.filter((v) => v.product_id === product.id),
      }));

      return reply.code(200).send(result);
    } catch (err) {
      req.log.error("Error getAll Products:", err);
      return reply
        .code(500)
        .send({ message: "Gagal mengambil data produk.", error: err.message });
    }
  },

  // -----------------------------------------------------------------
  // Membuat Produk Baru
  // -----------------------------------------------------------------
  async create(req, reply) {
    const {
      name,
      category,
      description,
      short_description,
      image_url,
      variants,
    } = req.body;

    try {
      if (!name || !image_url) {
        return reply
          .code(400)
          .send({ message: "Nama dan URL Thumbnail wajib diisi." });
      }

      // Insert produk
      const { rows } = await db.execute({
        sql: `INSERT INTO products (name, category, thumbnail_url, short_description, long_description, is_active)
              VALUES (?, ?, ?, ?, ?, 1) RETURNING *`,
        args: [
          name,
          category || "Streaming",
          image_url,
          short_description || null,
          description || null,
        ],
      });

      const newProduct = rows[0];

      // Insert varian
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          await db.execute({
            sql: `INSERT INTO product_variants (product_id, account_type, duration, cost_price, sell_price, is_active)
                  VALUES (?, ?, ?, ?, ?, 1)`,
            args: [
              newProduct.id,
              v.type,
              v.dur,
              Number(v.cost_price) || 0,
              Number(v.price) || 0,
            ],
          });
        }
      }

      return reply.code(201).send({
        status: "success",
        message: "Produk dan varian berhasil disimpan!",
        data: newProduct,
      });
    } catch (err) {
      req.log.error("Error create Product:", err);
      return reply.code(500).send({
        message: "Terjadi kesalahan saat menyimpan produk.",
        error: err.message || err,
      });
    }
  },

  // -----------------------------------------------------------------
  // Update Produk
  // -----------------------------------------------------------------
  async update(req, reply) {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      short_description,
      image_url,
      variants,
    } = req.body;

    try {
      // Update info utama produk
      await db.execute({
        sql: `UPDATE products SET name = ?, category = ?, thumbnail_url = ?, short_description = ?, long_description = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [name, category, image_url, short_description, description, id],
      });

      if (variants && Array.isArray(variants)) {
        // Ambil ID varian yang dikirim dari frontend (yang masih ada)
        const incomingIds = variants.filter((v) => v.id).map((v) => v.id);

        // Hapus varian yang tidak ada lagi di list
        if (incomingIds.length > 0) {
          const placeholders = incomingIds.map(() => "?").join(",");
          await db.execute({
            sql: `DELETE FROM product_variants WHERE product_id = ? AND id NOT IN (${placeholders})`,
            args: [id, ...incomingIds],
          });
        } else {
          // Kalau semua baru, hapus semua varian lama
          await db.execute({
            sql: "DELETE FROM product_variants WHERE product_id = ?",
            args: [id],
          });
        }

        // Update atau Insert varian
        for (const v of variants) {
          if (v.id) {
            await db.execute({
              sql: `UPDATE product_variants SET account_type = ?, duration = ?, cost_price = ?, sell_price = ? WHERE id = ?`,
              args: [v.type, v.dur, v.cost_price, v.price, v.id],
            });
          } else {
            await db.execute({
              sql: `INSERT INTO product_variants (product_id, account_type, duration, cost_price, sell_price, is_active)
                    VALUES (?, ?, ?, ?, ?, 1)`,
              args: [id, v.type, v.dur, v.cost_price, v.price],
            });
          }
        }
      }

      return reply.send({
        status: "success",
        message: "Produk dan varian berhasil diperbarui!",
      });
    } catch (err) {
      return reply
        .code(500)
        .send({ message: "Gagal update.", error: err.message });
    }
  },

  // -----------------------------------------------------------------
  // Hapus Produk (CASCADE akan hapus varian juga)
  // -----------------------------------------------------------------
  async delete(req, reply) {
    const { id } = req.params;

    try {
      if (!id) {
        return reply.code(400).send({ message: "ID Produk tidak ditemukan." });
      }

      const { rows } = await db.execute({
        sql: "DELETE FROM products WHERE id = ? RETURNING *",
        args: [id],
      });

      if (!rows || rows.length === 0) {
        return reply.code(404).send({ message: "Produk tidak ditemukan." });
      }

      return reply.code(200).send({
        status: "success",
        message: "Produk berhasil dihapus secara permanen.",
      });
    } catch (err) {
      req.log.error("Error delete Product:", err);
      return reply.code(500).send({
        message: "Terjadi kesalahan saat menghapus data.",
        error: err.message || err,
      });
    }
  },
};

module.exports = ProductController;
