require("dotenv").config();
const fastify = require("./src/app"); // Memanggil konfigurasi dari app.js

const start = async () => {
  try {
    // Port 3000 sangat pas buat ThinkPad T460 lu
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("🚀 Server ZFTStoree Aktif di http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
