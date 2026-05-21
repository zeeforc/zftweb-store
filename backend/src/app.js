const fastify = require("fastify")({ logger: false, bodyLimit: 10485760 });
const fastifyCors = require("@fastify/cors");

// Di Vercel env vars di-inject langsung
try {
  require("dotenv").config();
} catch (e) {}

const db = require("./config/database");

// 1. IMPORT CONTROLLER
const ProductController = require("./modules/products/controller");
const OrderController = require("./modules/orders/controller");
const InventoryController = require("./modules/inventory/controller");

// 2. CORS
fastify.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// 3. Enable foreign keys di SQLite (penting buat ON DELETE CASCADE)
fastify.addHook("onReady", async () => {
  await db.execute("PRAGMA foreign_keys = ON");
});

// route product
fastify.get("/api/products", ProductController.getAll);
fastify.post("/api/admin/products", ProductController.create);
fastify.put("/api/admin/products/:id", ProductController.update);
fastify.delete("/api/admin/products/:id", ProductController.delete);

// route inventory
fastify.get("/api/admin/inventory", InventoryController.getAll);
fastify.post("/api/admin/inventory", InventoryController.addStock);
fastify.delete("/api/admin/inventory/:id", InventoryController.delete);
fastify.patch(
  "/api/admin/variants/:id/status",
  InventoryController.updateVariantStatus,
);

// route order & payment
fastify.post("/api/checkout", OrderController.createOrder);
fastify.post("/api/webhook/tripay", OrderController.handleTripayWebhook);
fastify.get("/api/orders/status", OrderController.checkOrderStatus);
fastify.get("/api/orders/my-items", OrderController.getMyItems);

module.exports = fastify;
