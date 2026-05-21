/**
 * Migration Script - Setup semua tabel untuk ZFTStoree
 * Jalankan: node src/migrations/migrate.js
 */
const db = require("../config/database");

async function migrate() {
  console.log("🔄 Memulai migrasi database...\n");

  // 1. Tabel Products
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Streaming',
      thumbnail_url TEXT,
      short_description TEXT,
      long_description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ Tabel 'products' siap.");

  // 2. Tabel Product Variants
  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      account_type TEXT NOT NULL,
      duration TEXT NOT NULL,
      cost_price REAL DEFAULT 0,
      sell_price REAL DEFAULT 0,
      stock_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Tabel 'product_variants' siap.");

  // 3. Tabel Inventory (Stok Akun)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variant_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      profile_name TEXT,
      pin TEXT,
      status TEXT DEFAULT 'available',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Tabel 'inventory' siap.");

  // 4. Tabel Orders
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      variant_id INTEGER NOT NULL,
      total_price REAL NOT NULL,
      voucher_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    )
  `);
  console.log("✅ Tabel 'orders' siap.");

  // 5. Tabel Delivered Items
  await db.execute(`
    CREATE TABLE IF NOT EXISTS delivered_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      account_details TEXT,
      delivered_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Tabel 'delivered_items' siap.");

  // 6. Tabel Cash Flow
  await db.execute(`
    CREATE TABLE IF NOT EXISTS cash_flow (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      entry_type TEXT NOT NULL,
      amount REAL NOT NULL,
      source TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);
  console.log("✅ Tabel 'cash_flow' siap.");

  console.log("\n🎉 Migrasi selesai! Semua tabel berhasil dibuat.");
}

migrate().catch((err) => {
  console.error("❌ Migrasi gagal:", err);
  process.exit(1);
});
