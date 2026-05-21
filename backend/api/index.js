const fastify = require("../src/app");

// Export sebagai serverless handler untuk Vercel
module.exports = async (req, res) => {
  await fastify.ready();
  fastify.server.emit("request", req, res);
};
