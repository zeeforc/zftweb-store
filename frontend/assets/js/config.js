// API Base URL - otomatis detect environment
const API_BASE =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "";
