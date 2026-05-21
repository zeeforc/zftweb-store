// ==========================================
// RENDER NAVBAR
// ==========================================
function renderNavbar() {
  const navbarHTML = `
    <nav class="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          
          <!-- Kiri: Logo & Search -->
          <div class="flex items-center gap-8 flex-1">
            <a href="#" onclick="showHome(event)" class="flex items-center gap-2 text-xl font-bold text-gray-900 tracking-tight">
              <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <i data-lucide="layers" class="w-5 h-5"></i>
              </div>
              AppStoreHub
            </a>
            <div class="hidden lg:flex flex-1 max-w-md relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i data-lucide="search" class="h-4 w-4 text-gray-400"></i>
              </div>
              <input type="text" class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" placeholder="Cari aplikasi..." />
            </div>
          </div>

          <!-- Tengah: Nav Links -->
          <div class="hidden md:flex items-center justify-center gap-8 flex-1" id="main-nav-links">
            <a href="#apps" onclick="showHome(event)" class="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Aplikasi</a>
            <a href="#categories" onclick="showHome(event)" class="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Kategori</a>
            <a href="#pricing" onclick="showHome(event)" class="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Harga</a>
            <a href="#support" onclick="showHome(event)" class="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Bantuan</a>
          </div>

          <!-- Kanan: Icons & Auth -->
          <div class="flex items-center justify-end gap-5 flex-1">
            <button onclick="openCart()" class="text-gray-500 hover:text-gray-900 relative transition-colors">
              <i data-lucide="shopping-cart" class="w-5 h-5"></i>
              <span id="cart-counter" class="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white transition-transform duration-300">0</span>
            </button>
            <div class="hidden sm:block w-px h-6 bg-gray-200"></div>
            
            <!-- Link ke Profile -->
            <button onclick="showProfile(event)" class="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors group">
              <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:shadow-primary/30 transition-all">
                  BS
              </div>
              <span class="hidden lg:block">Budi Santoso</span>
            </button>
            <button class="md:hidden text-gray-500"><i data-lucide="menu" class="w-6 h-6"></i></button>
          </div>
        </div>
      </div>
    </nav>
  `;
  const container = document.getElementById("navbar-container");
  if (container) container.innerHTML = navbarHTML;
}

// ==========================================
// RENDER CART SIDEBAR
// ==========================================
function renderCartSidebar() {
  const cartHTML = `
    <!-- Overlay Cart -->
    <div id="cart-overlay" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[105] hidden opacity-0 transition-opacity duration-300" onclick="closeCart()"></div>
    
    <!-- Sidebar Cart -->
    <div id="cart-sidebar" class="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[110] transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col shadow-2xl">
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div class="flex items-center gap-2"><i data-lucide="shopping-bag" class="w-5 h-5 text-primary"></i><h2 class="text-lg font-bold text-gray-900">Keranjang Anda</h2></div>
          <button onclick="closeCart()" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"><i data-lucide="x" class="w-4 h-4"></i></button>
      </div>
      
      <div id="cart-items-container" class="flex-grow overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-surface">
          <!-- Items akan di-render dinamis via JS -->
      </div>
      
      <div class="border-t border-gray-100 p-6 bg-white z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div class="flex items-center justify-between mb-4">
              <span class="text-sm text-gray-500 font-medium">Total Pembayaran</span>
              <span id="cart-total-price" class="text-2xl font-bold text-gray-900">Rp 0</span>
          </div>
          <!-- Tombol Buka Checkout Modal -->
          <button onclick="openCheckoutModal()" class="w-full bg-primary hover:bg-primaryHover text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/30">
              <i data-lucide="credit-card" class="w-5 h-5"></i> Checkout Sekarang
          </button>
      </div>
    </div>
  `;
  const container = document.getElementById("cart-container");
  if (container) container.innerHTML = cartHTML;
}

// ==========================================
// RENDER PROFILE PAGE
// ==========================================
function renderProfilePage() {
  const profileHTML = `
    <div class="pt-28 pb-20 min-h-screen bg-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            <!-- Sidebar Navigasi Profil -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 text-center">
                    <div class="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-primary/30">BS</div>
                    <h2 class="text-xl font-bold text-gray-900">Budi Santoso</h2>
                    <p class="text-gray-500 text-sm mb-4">budi.santoso@email.com</p>
                    <span class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        <i data-lucide="shield-check" class="w-3 h-3"></i> Member Premium
                    </span>
                </div>
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
                    <button onclick="switchProfileTab('akun-saya')" class="profile-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 text-primary font-medium transition-colors text-left w-full"><i data-lucide="package" class="w-5 h-5"></i> Akun Saya</button>
                    <button onclick="switchProfileTab('riwayat')" class="profile-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors text-left w-full"><i data-lucide="clock" class="w-5 h-5"></i> Riwayat Transaksi</button>
                    <button onclick="switchProfileTab('pengaturan')" class="profile-tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors text-left w-full"><i data-lucide="settings" class="w-5 h-5"></i> Pengaturan</button>
                    <hr class="my-2 border-gray-100">
                    <button onclick="showHome(event)" class="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-colors text-left w-full"><i data-lucide="log-out" class="w-5 h-5"></i> Keluar</button>
                </div>
            </div>

            <!-- Content Area Profil -->
            <div class="lg:col-span-3 space-y-6">
                <!-- Stats Overview -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><i data-lucide="shopping-bag" class="w-6 h-6"></i></div><div><p class="text-sm text-gray-500 font-medium">Total Transaksi</p><h3 class="text-2xl font-bold text-gray-900">15</h3></div></div>
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0"><i data-lucide="ticket" class="w-6 h-6"></i></div><div><p class="text-sm text-gray-500 font-medium">Voucher Tersedia</p><h3 class="text-2xl font-bold text-gray-900">2</h3></div></div>
                     <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0"><i data-lucide="coins" class="w-6 h-6"></i></div><div><p class="text-sm text-gray-500 font-medium">AppStore Poin</p><h3 class="text-2xl font-bold text-gray-900">1.250</h3></div></div>
                </div>

                <!-- TAB 1: AKUN SAYA -->
                <div id="content-akun-saya" class="profile-content block animate-modal-enter">
                  <div class="flex items-center justify-between mt-8 mb-4"><h3 class="text-xl font-bold text-gray-900">Detail Akun Aktif</h3></div>
                  <div class="space-y-6">
                      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                          <div class="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">AKTIF</div>
                          <div class="flex flex-col md:flex-row md:items-start gap-6">
                              <div class="w-16 h-16 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-3xl flex-shrink-0 border border-red-100 shadow-sm">N</div>
                              <div class="flex-grow">
                                  <div class="mb-4">
                                      <h4 class="text-xl font-bold text-gray-900 mb-1">Netflix Premium</h4>
                                      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                          <p class="text-gray-500">Jenis: <span class="font-medium text-gray-900">1P1U (Sharing)</span></p><span class="w-1 h-1 rounded-full bg-gray-300"></span>
                                          <p class="text-gray-500">Durasi: <span class="font-medium text-gray-900">1 Bulan</span></p><span class="w-1 h-1 rounded-full bg-gray-300"></span>
                                          <p class="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">Sisa 24 Hari</p>
                                      </div>
                                  </div>
                                  <div class="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100">
                                      <div><p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Email Akun</p><div class="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-gray-200 shadow-sm"><span class="text-sm font-mono text-gray-800 truncate">netflix01@appstorehub.com</span><button onclick="copyToClipboard('netflix01@appstorehub.com')" class="text-gray-400 hover:text-primary transition-colors flex-shrink-0 ml-2"><i data-lucide="copy" class="w-4 h-4"></i></button></div></div>
                                      <div><p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Password</p><div class="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-gray-200 shadow-sm"><span class="text-sm font-mono text-gray-800 truncate">NtfBudi!23</span><button onclick="copyToClipboard('NtfBudi!23')" class="text-gray-400 hover:text-primary transition-colors flex-shrink-0 ml-2"><i data-lucide="copy" class="w-4 h-4"></i></button></div></div>
                                      <div><p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Profil Kamu</p><div class="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-gray-200 shadow-sm"><span class="text-sm font-medium text-gray-800 truncate">Profil 3 - Budi</span></div></div>
                                      <div><p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">PIN Profil</p><div class="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-gray-200 shadow-sm"><span class="text-sm font-mono text-gray-800 truncate">1234</span><button onclick="copyToClipboard('1234')" class="text-gray-400 hover:text-primary transition-colors flex-shrink-0 ml-2"><i data-lucide="copy" class="w-4 h-4"></i></button></div></div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                          <div class="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">AKTIF</div>
                          <div class="flex flex-col md:flex-row md:items-start gap-6">
                              <div class="w-16 h-16 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-3xl flex-shrink-0 border border-purple-100 shadow-sm">C</div>
                              <div class="flex-grow">
                                  <div class="mb-4">
                                      <h4 class="text-xl font-bold text-gray-900 mb-1">Canva Pro</h4>
                                      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                          <p class="text-gray-500">Jenis: <span class="font-medium text-gray-900">Private</span></p><span class="w-1 h-1 rounded-full bg-gray-300"></span>
                                          <p class="text-gray-500">Durasi: <span class="font-medium text-gray-900">1 Bulan</span></p><span class="w-1 h-1 rounded-full bg-gray-300"></span>
                                          <p class="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">Sisa 12 Hari</p>
                                      </div>
                                  </div>
                                  <div class="bg-gray-50 rounded-xl p-4 grid grid-cols-1 gap-4 border border-gray-100">
                                      <div>
                                          <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Status Upgrade</p>
                                          <div class="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                                              <i data-lucide="check-circle" class="w-5 h-5 text-emerald-500"></i>
                                              <span class="text-sm font-medium text-gray-800">Email budi.santoso@email.com telah diupgrade ke Canva Pro.</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                </div>

                <!-- TAB 2: RIWAYAT TRANSAKSI -->
                <div id="content-riwayat" class="profile-content hidden animate-modal-enter">
                  <div class="flex items-center justify-between mt-8 mb-4">
                      <h3 class="text-xl font-bold text-gray-900">Riwayat Transaksi</h3>
                  </div>
                  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div class="overflow-x-auto">
                          <table class="w-full text-left border-collapse whitespace-nowrap">
                              <thead>
                                  <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                      <th class="px-6 py-4 font-medium">Order ID</th>
                                      <th class="px-6 py-4 font-medium">Tanggal</th>
                                      <th class="px-6 py-4 font-medium">Produk</th>
                                      <th class="px-6 py-4 font-medium">Total</th>
                                      <th class="px-6 py-4 font-medium">Status</th>
                                  </tr>
                              </thead>
                              <tbody class="text-sm divide-y divide-gray-100">
                                  <tr class="hover:bg-gray-50/50 transition-colors">
                                      <td class="px-6 py-4 font-mono text-gray-900">#TRX-98231</td>
                                      <td class="px-6 py-4 text-gray-500">24 Okt 2026</td>
                                      <td class="px-6 py-4 font-medium text-gray-900">Netflix Premium (1 Bulan)</td>
                                      <td class="px-6 py-4 text-gray-900">Rp 35.000</td>
                                      <td class="px-6 py-4"><span class="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">Berhasil</span></td>
                                  </tr>
                                  <tr class="hover:bg-gray-50/50 transition-colors">
                                      <td class="px-6 py-4 font-mono text-gray-900">#TRX-87122</td>
                                      <td class="px-6 py-4 text-gray-500">12 Sep 2026</td>
                                      <td class="px-6 py-4 font-medium text-gray-900">Canva Pro (1 Bulan)</td>
                                      <td class="px-6 py-4 text-gray-900">Rp 25.000</td>
                                      <td class="px-6 py-4"><span class="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">Berhasil</span></td>
                                  </tr>
                                  <tr class="hover:bg-gray-50/50 transition-colors">
                                      <td class="px-6 py-4 font-mono text-gray-900">#TRX-87005</td>
                                      <td class="px-6 py-4 text-gray-500">10 Sep 2026</td>
                                      <td class="px-6 py-4 font-medium text-gray-900">Spotify Premium (1 Bulan)</td>
                                      <td class="px-6 py-4 text-gray-900">Rp 22.000</td>
                                      <td class="px-6 py-4"><span class="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">Kadaluarsa</span></td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
                </div>

                <!-- TAB 3: PENGATURAN -->
                <div id="content-pengaturan" class="profile-content hidden animate-modal-enter">
                  <div class="flex items-center justify-between mt-8 mb-4">
                      <h3 class="text-xl font-bold text-gray-900">Pengaturan Akun</h3>
                  </div>
                  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <form onsubmit="event.preventDefault(); showToastMessage('Profil berhasil diperbarui!');" class="space-y-5 max-w-lg">
                          <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                              <input type="text" value="Budi Santoso" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Akun</label>
                              <input type="email" value="budi.santoso@email.com" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none bg-gray-50 text-gray-500 cursor-not-allowed" readonly>
                              <p class="text-xs text-gray-400 mt-1.5">Email tidak dapat diubah karena terhubung dengan data pesanan Anda.</p>
                          </div>
                          <hr class="border-gray-100 my-4">
                          <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
                              <input type="password" placeholder="Kosongkan jika tidak ingin mengubah" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1.5">Ulangi Password Baru</label>
                              <input type="password" placeholder="Konfirmasi password" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                          </div>
                          <div class="pt-2">
                              <button type="submit" class="bg-primary hover:bg-primaryHover text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-primary/30">Simpan Perubahan</button>
                          </div>
                      </form>
                  </div>
                </div>

            </div>
         </div>
      </div>
    </div>
  `;
  const container = document.getElementById("profile-container");
  if (container) container.innerHTML = profileHTML;
}

// ==========================================
// RENDER FOOTER
// ==========================================
function renderFooter() {
  const footerHTML = `
    <footer class="bg-white border-t border-gray-100 pt-16 pb-8 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div class="md:col-span-1">
            <a href="#" onclick="showHome(event)" class="flex items-center gap-2 text-xl font-bold text-gray-900 tracking-tight mb-4">
              <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <i data-lucide="layers" class="w-5 h-5"></i>
              </div>
              AppStoreHub
            </a>
            <p class="text-sm text-gray-500 leading-relaxed mb-6">
              Destinasi terpercaya Anda untuk berlangganan aplikasi premium yang terjangkau. Cepat, aman, dan dapat diandalkan.
            </p>
            <div class="flex gap-4 text-gray-400">
                <a href="#" class="hover:text-primary transition-colors"><i data-lucide="facebook" class="w-5 h-5"></i></a>
                <a href="#" class="hover:text-primary transition-colors"><i data-lucide="twitter" class="w-5 h-5"></i></a>
                <a href="#" class="hover:text-primary transition-colors"><i data-lucide="instagram" class="w-5 h-5"></i></a>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-4">Platform</h3>
            <ul class="space-y-3">
              <li><a href="#apps" onclick="showHome(event)" class="text-sm text-gray-500 hover:text-primary transition-colors">Jelajahi Aplikasi</a></li>
              <li><a href="#categories" onclick="showHome(event)" class="text-sm text-gray-500 hover:text-primary transition-colors">Kategori</a></li>
              <li><a href="#pricing" onclick="showHome(event)" class="text-sm text-gray-500 hover:text-primary transition-colors">Daftar Harga</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-4">Dukungan</h3>
            <ul class="space-y-3">
              <li><a href="#" class="text-sm text-gray-500 hover:text-primary transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" class="text-sm text-gray-500 hover:text-primary transition-colors">Hubungi Kami</a></li>
              <li><a href="#" class="text-sm text-gray-500 hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-4">Legal</h3>
            <ul class="space-y-3">
              <li><a href="#" class="text-sm text-gray-500 hover:text-primary transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" class="text-sm text-gray-500 hover:text-primary transition-colors">Syarat & Ketentuan</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-sm text-gray-500">&copy; 2026 AppStoreHub. Hak Cipta Dilindungi.</p>
          <div class="flex items-center gap-2">
              <div class="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">QRIS</div>
              <div class="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">DANA</div>
              <div class="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">GOPAY</div>
          </div>
        </div>
      </div>
    </footer>
  `;
  const container = document.getElementById("footer-container");
  if (container) container.innerHTML = footerHTML;
}

// Inisialisasi DOM
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderCartSidebar();
  renderProfilePage();
  renderFooter();
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});
