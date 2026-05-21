const app = require("../src/app");

module.exports = async (req, res) => {
  await app.ready();

  // Collect body for non-GET requests
  let body = "";
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks).toString("utf8");
  }

  // Use Fastify's inject to handle the request internally
  const response = await app.inject({
    method: req.method,
    url: req.url,
    headers: req.headers,
    payload: body || undefined,
  });

  // Forward response
  res.statusCode = response.statusCode;
  const headers = response.headers;
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      res.setHeader(key, value);
    }
  }
  res.end(response.body);
};
