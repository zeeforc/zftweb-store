const { createClient } = require("@libsql/client");
require("dotenv").config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./data/zftstoree.db",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

module.exports = db;
