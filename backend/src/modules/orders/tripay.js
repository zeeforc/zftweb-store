const crypto = require("crypto");

const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY || "";
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY || "";
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE || "";
const TRIPAY_MODE = process.env.TRIPAY_MODE || "sandbox"; // sandbox | production

const BASE_URL =
  TRIPAY_MODE === "production"
    ? "https://tripay.co.id/api"
    : "https://tripay.co.id/api-sandbox";

/**
 * Generate HMAC-SHA256 signature untuk Tripay
 */
function generateSignature(merchantRef, amount) {
  const data = TRIPAY_MERCHANT_CODE + merchantRef + amount;
  return crypto
    .createHmac("sha256", TRIPAY_PRIVATE_KEY)
    .update(data)
    .digest("hex");
}

/**
 * Validasi callback signature dari Tripay
 */
function verifyCallbackSignature(jsonBody, receivedSignature) {
  const signature = crypto
    .createHmac("sha256", TRIPAY_PRIVATE_KEY)
    .update(jsonBody)
    .digest("hex");
  return signature === receivedSignature;
}

/**
 * Buat transaksi closed payment di Tripay
 * @param {Object} params
 * @param {string} params.method - Payment channel code (QRIS, DANA, dll)
 * @param {string} params.merchantRef - Unique reference dari sistem kita
 * @param {number} params.amount - Total amount
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {Array} params.orderItems - Array of {name, price, quantity}
 * @param {string} params.callbackUrl - URL webhook callback
 * @param {string} params.returnUrl - URL redirect setelah bayar
 */
async function createTransaction(params) {
  const {
    method,
    merchantRef,
    amount,
    customerName,
    customerEmail,
    orderItems,
    callbackUrl,
    returnUrl,
  } = params;

  const signature = generateSignature(merchantRef, amount);

  const payload = {
    method,
    merchant_ref: merchantRef,
    amount,
    customer_name: customerName,
    customer_email: customerEmail,
    order_items: orderItems,
    callback_url: callbackUrl,
    return_url: returnUrl,
    expired_time: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 jam
    signature,
  };

  const response = await fetch(`${BASE_URL}/transaction/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TRIPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}

/**
 * Cek detail transaksi di Tripay
 */
async function getTransactionDetail(reference) {
  const response = await fetch(
    `${BASE_URL}/transaction/detail?reference=${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TRIPAY_API_KEY}`,
      },
    },
  );

  const data = await response.json();
  return data;
}

module.exports = {
  generateSignature,
  verifyCallbackSignature,
  createTransaction,
  getTransactionDetail,
  TRIPAY_MERCHANT_CODE,
};
