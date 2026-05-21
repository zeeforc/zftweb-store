// State Cart (Menggunakan Object agar bisa simpan kuantitas)
let cartItems = JSON.parse(localStorage.getItem("appStoreCart")) || {};

function saveCart() {
  localStorage.setItem("appStoreCart", JSON.stringify(cartItems));
}

function updateCartCounter() {
  const totalQty = Object.values(cartItems).reduce(
    (sum, item) => sum + item.qty,
    0,
  );

  const cartCounter = document.getElementById("cart-counter");
  if (cartCounter) {
    cartCounter.innerText = totalQty;
    cartCounter.classList.add("scale-150");
    setTimeout(() => cartCounter.classList.remove("scale-150"), 200);
  }

  const sidebar = document.getElementById("cart-sidebar");
  if (sidebar && !sidebar.classList.contains("translate-x-full")) {
    renderCart();
  }

  saveCart();
}

// Pastikan fungsi ini jalan setelah DOM siap (setTimeout nunggu injection components.js)
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    updateCartCounter();
  }, 100);
});

function parsePrice(priceStr) {
  return parseInt(priceStr.replace(/[^0-9]/g, ""));
}
function formatPrice(priceNum) {
  return "Rp " + priceNum.toLocaleString("id-ID");
}

function removeFromCart(cartKey) {
  delete cartItems[cartKey];
  updateCartCounter();
}

function updateQty(event, cartKey, delta) {
  if (event) event.stopPropagation();
  if (cartItems[cartKey]) {
    cartItems[cartKey].qty += delta;
    if (cartItems[cartKey].qty <= 0) {
      delete cartItems[cartKey];
    }
    updateCartCounter();
  }
}

function addToCart(event, appId) {
  if (event) event.stopPropagation();
  const product = products[appId];
  const defaultType = product.category === "streaming" ? "1P1U" : "Private";
  const defaultDuration = "1 Bulan";
  const cartKey = `${appId}_${defaultType}_${defaultDuration}`;

  if (cartItems[cartKey]) {
    cartItems[cartKey].qty++;
  } else {
    cartItems[cartKey] = {
      appId: appId,
      type: defaultType,
      duration: defaultDuration,
      qty: 1,
    };
  }
  updateCartCounter();
}

function addToCartFromModal(event, appId) {
  if (event) event.stopPropagation();

  const typeBtn = document.querySelector(
    '#account-type-selector button[data-selected="true"]',
  );
  const durationBtn = document.querySelector(
    '#duration-selector button[data-selected="true"]',
  );

  const type = typeBtn
    ? typeBtn.innerText.trim()
    : products[appId].category === "streaming"
      ? "1P1U"
      : "Private";
  const durationRaw = durationBtn
    ? durationBtn.getAttribute("data-duration")
    : "1 Bulan";

  const cartKey = `${appId}_${type}_${durationRaw}`;

  if (cartItems[cartKey]) {
    cartItems[cartKey].qty++;
  } else {
    cartItems[cartKey] = {
      appId: appId,
      type: type,
      duration: durationRaw,
      qty: 1,
    };
  }
  updateCartCounter();
}

function openCart() {
  document.body.classList.add("modal-open");
  const overlay = document.getElementById("cart-overlay");
  const sidebar = document.getElementById("cart-sidebar");

  if (overlay) overlay.classList.remove("hidden");
  setTimeout(() => {
    if (overlay) overlay.classList.remove("opacity-0");
  }, 10);
  if (sidebar) sidebar.classList.remove("translate-x-full");

  renderCart();
}

function closeCart() {
  const modal = document.getElementById("product-modal");
  if (!modal || modal.classList.contains("hidden")) {
    document.body.classList.remove("modal-open");
  }

  const overlay = document.getElementById("cart-overlay");
  const sidebar = document.getElementById("cart-sidebar");

  if (overlay) overlay.classList.add("opacity-0");
  if (sidebar) sidebar.classList.add("translate-x-full");

  setTimeout(() => {
    if (overlay) overlay.classList.add("hidden");
  }, 300);
}

function renderCart() {
  const container = document.getElementById("cart-items-container");
  const totalEl = document.getElementById("cart-total-price");
  if (!container || !totalEl) return;

  container.innerHTML = "";
  let total = 0;

  if (Object.keys(cartItems).length === 0) {
    container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center text-gray-400 mt-20">
                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i data-lucide="shopping-cart" class="w-10 h-10 text-gray-300"></i>
                </div>
                <h3 class="text-gray-900 font-bold mb-1">Keranjang Kosong</h3>
                <p class="text-sm mb-6">Yuk, tambahkan aplikasi incaranmu!</p>
                <button onclick="closeCart(); showHome(event);" class="text-primary font-bold text-sm bg-primary/10 px-6 py-2 rounded-full hover:bg-primary/20 transition-colors">Mulai Belanja</button>
            </div>
          `;
    totalEl.innerText = "Rp 0";
    lucide.createIcons({ root: container });
    return;
  }

  Object.keys(cartItems).forEach((cartKey) => {
    const item = cartItems[cartKey];
    const product = products[item.appId];
    if (!product) return;

    const itemTotal = parsePrice(product.price) * item.qty;
    total += itemTotal;

    let logoHTML = "";
    if (product.icon) {
      logoHTML = `<i data-lucide="${product.icon}" class="w-6 h-6"></i>`;
    } else {
      logoHTML = product.logoText;
    }

    const itemHTML = `
            <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 relative group animate-modal-enter">
                <!-- Thumbnail -->
                <div class="w-16 h-16 rounded-xl ${product.bgClass} ${product.textClass} flex items-center justify-center font-black text-xl flex-shrink-0">
                    ${logoHTML}
                </div>
                
                <!-- Detail -->
                <div class="flex flex-col justify-center flex-grow pr-4">
                    <h4 class="font-bold text-gray-900 text-sm mb-0.5">${product.name}</h4>
                    <span class="text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded w-fit mb-2">${item.type} • ${item.duration}</span>
                    
                    <div class="flex items-center justify-between w-full mt-auto">
                        <span class="font-bold text-primary text-sm">${formatPrice(itemTotal)}</span>
                        
                        <!-- Qty Controls -->
                        <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                            <button onclick="updateQty(event, '${cartKey}', -1)" class="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-500 hover:text-primary transition-colors">-</button>
                            <span class="text-xs font-bold w-4 text-center text-gray-700">${item.qty}</span>
                            <button onclick="updateQty(event, '${cartKey}', 1)" class="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-500 hover:text-primary transition-colors">+</button>
                        </div>
                    </div>
                </div>

                <!-- Hapus Button -->
                <button onclick="removeFromCart('${cartKey}')" class="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
          `;
    container.insertAdjacentHTML("beforeend", itemHTML);
  });

  totalEl.innerText = formatPrice(total);
  lucide.createIcons({ root: container });
}
