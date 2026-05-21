/**
 * Seed Script - Isi data awal produk ke database
 * Jalankan: node src/migrations/seed.js
 */
const db = require("../config/database");

async function seed() {
  console.log("🌱 Mulai seeding data produk...\n");

  const products = [
    {
      name: "Netflix Premium",
      category: "Streaming",
      thumbnail_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Netflix_icon.svg/960px-Netflix_icon.svg.png",
      short_description: "Streaming film & series premium 4K UHD",
      long_description:
        "Akses penuh ke semua konten Netflix termasuk film, series, dan dokumenter dalam kualitas 4K Ultra HD. Tanpa iklan, download offline tersedia.",
      variants: [
        { type: "Sharing 1P1U", dur: "1 Bulan", cost: 15000, price: 35000 },
        { type: "Sharing 1P1U", dur: "3 Bulan", cost: 40000, price: 90000 },
        { type: "Private", dur: "1 Bulan", cost: 30000, price: 55000 },
      ],
    },
    {
      name: "Spotify Premium",
      category: "Musik",
      thumbnail_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1280px-Spotify_icon.svg.png",
      short_description: "Musik tanpa iklan, kualitas tinggi",
      long_description:
        "Dengarkan jutaan lagu tanpa iklan, download untuk offline, dan nikmati kualitas audio tinggi. Bisa skip sepuasnya.",
      variants: [
        { type: "Sharing 1P1U", dur: "1 Bulan", cost: 8000, price: 22000 },
        { type: "Sharing 1P1U", dur: "3 Bulan", cost: 20000, price: 55000 },
        { type: "Private", dur: "1 Bulan", cost: 18000, price: 35000 },
      ],
    },
    {
      name: "Canva Pro",
      category: "Alat Desain",
      thumbnail_url:
        "https://cdn-1.webcatalog.io/catalog/canva-cn/canva-cn-icon-filled-256.webp",
      short_description: "Desain grafis profesional tanpa batas",
      long_description:
        "Akses semua template premium, hapus background, resize magic, brand kit, dan jutaan elemen desain. Cocok untuk content creator dan bisnis.",
      variants: [
        { type: "Private", dur: "1 Bulan", cost: 10000, price: 25000 },
        { type: "Private", dur: "3 Bulan", cost: 25000, price: 65000 },
        { type: "Tim (5 Orang)", dur: "1 Bulan", cost: 20000, price: 45000 },
      ],
    },
    {
      name: "ChatGPT Plus",
      category: "Alat AI",
      thumbnail_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/1280px-ChatGPT-Logo.svg.png",
      short_description: "AI assistant dengan GPT-4 tanpa limit",
      long_description:
        "Akses GPT-4, DALL-E, browsing internet, plugin, dan fitur advanced data analysis. Respon lebih cepat dan prioritas saat peak hours.",
      variants: [
        { type: "Sharing", dur: "1 Bulan", cost: 35000, price: 75000 },
        { type: "Private", dur: "1 Bulan", cost: 80000, price: 150000 },
      ],
    },
    {
      name: "CapCut Pro",
      category: "Edit Video",
      thumbnail_url:
        "https://upload.wikimedia.org/wikipedia/commons/0/0c/Capcut-icon.png",
      short_description: "Edit video profesional tanpa watermark",
      long_description:
        "Akses semua efek premium, template trending, hapus background video, dan export tanpa watermark. Tersedia di mobile dan desktop.",
      variants: [
        { type: "Private", dur: "1 Bulan", cost: 8000, price: 20000 },
        { type: "Private", dur: "3 Bulan", cost: 20000, price: 50000 },
      ],
    },
    {
      name: "YouTube Premium",
      category: "Streaming",
      thumbnail_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png",
      short_description: "YouTube tanpa iklan + YouTube Music",
      long_description:
        "Tonton video tanpa iklan, putar di background, download offline, dan akses penuh YouTube Music Premium.",
      variants: [
        { type: "Sharing", dur: "1 Bulan", cost: 10000, price: 25000 },
        { type: "Private", dur: "1 Bulan", cost: 25000, price: 45000 },
      ],
    },
    {
      name: "Disney+ Hotstar",
      category: "Streaming",
      thumbnail_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/1280px-Disney%2B_logo.svg.png",
      short_description: "Film Disney, Marvel, Star Wars & lebih",
      long_description:
        "Streaming konten eksklusif dari Disney, Pixar, Marvel, Star Wars, dan National Geographic. Tersedia dalam kualitas 4K.",
      variants: [
        { type: "Sharing 1P1U", dur: "1 Bulan", cost: 10000, price: 25000 },
        { type: "Private", dur: "1 Bulan", cost: 20000, price: 40000 },
      ],
    },
    {
      name: "Microsoft 365",
      category: "Produktivitas",
      thumbnail_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1280px-Microsoft_logo.svg.png",
      short_description: "Word, Excel, PowerPoint + 1TB OneDrive",
      long_description:
        "Paket lengkap Office (Word, Excel, PowerPoint, Outlook) plus 1TB penyimpanan OneDrive. Bisa install di 5 perangkat sekaligus.",
      variants: [
        { type: "Private", dur: "1 Bulan", cost: 12000, price: 30000 },
        { type: "Private", dur: "12 Bulan", cost: 80000, price: 180000 },
      ],
    },
  ];

  for (const product of products) {
    // Insert produk
    const { rows } = await db.execute({
      sql: `INSERT INTO products (name, category, thumbnail_url, short_description, long_description, is_active)
            VALUES (?, ?, ?, ?, ?, 1) RETURNING id`,
      args: [
        product.name,
        product.category,
        product.thumbnail_url,
        product.short_description,
        product.long_description,
      ],
    });

    const productId = rows[0].id;

    // Insert varian
    for (const v of product.variants) {
      await db.execute({
        sql: `INSERT INTO product_variants (product_id, account_type, duration, cost_price, sell_price, stock_count, is_active)
              VALUES (?, ?, ?, ?, ?, 0, 1)`,
        args: [productId, v.type, v.dur, v.cost, v.price],
      });
    }

    console.log(`✅ ${product.name} — ${product.variants.length} varian`);
  }

  console.log(
    `\n🎉 Seeding selesai! ${products.length} produk berhasil ditambahkan.`,
  );
}

seed().catch((err) => {
  console.error("❌ Seeding gagal:", err);
  process.exit(1);
});
