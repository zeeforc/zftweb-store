const { createClient } = require("@libsql/client");

// Di Vercel, env vars di-inject langsung. Dotenv hanya untuk local dev.
try {
  require("dotenv").config();
} catch (e) {}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./data/zftstoree.db",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

module.exports = db;
