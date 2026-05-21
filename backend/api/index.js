// Minimal test to verify Vercel function works
module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify({ ok: true, path: req.url, method: req.method }));
};
