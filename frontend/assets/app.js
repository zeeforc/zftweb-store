document.addEventListener("alpine:init", () => {
  Alpine.data("shopApp", () => ({
    tab: "dashboard",
    isModalOpen: false,
    modalType: "",

    // State Data dari Supabase
    inventoryData: [],

    // Form State
    newStock: { variant_id: "", accounts: "" },
    newProduct: {
      name: "",
      category: "Streaming",
      short_description: "",
      description: "",
      image_url: "",
    },
    // Sesuai skema varian di backend
    variants: [{ type: "Sharing 1P1U", dur: "1 Bulan", cost: 0, price: 0 }],

    // Lifecycle Alpine.js
    async init() {
      // Tunggu DOM siap, baru setup Chart & Icon
      setTimeout(() => {
        if (typeof lucide !== "undefined") lucide.createIcons();
        window.initCharts();
      }, 100);

      // Pantau perubahan tab, kalau masuk dashboard/analytic render ulang chart
      this.$watch("tab", (value) => {
        if (value === "dashboard" || value === "analytics") {
          setTimeout(() => {
            window.initCharts();
          }, 50);
        }
      });

      // Tarik data saat pertama kali buka
      await this.fetchInventory();
    },

    changeTab(newTab) {
      this.tab = newTab;
    },

    // -----------------------------------------------------------------
    // API: AMBIL DATA INVENTORY/PRODUCT
    // -----------------------------------------------------------------
    async fetchInventory() {
      try {
        const response = await fetch("http://localhost:3000/api/products");
        if (response.ok) {
          const data = await response.json();
          this.inventoryData = data;
        }
      } catch (error) {
        console.error("Gagal narik data dari backend:", error);
      }
    },

    // -----------------------------------------------------------------
    // ROUTER SUBMIT MODAL
    // -----------------------------------------------------------------
    handleModalSubmit() {
      if (this.modalType === "add-product") {
        this.submitProduct();
      } else if (this.modalType === "add-stock") {
        this.submitStock();
      }
    },

    // -----------------------------------------------------------------
    // API: TAMBAH PRODUK BARU
    // -----------------------------------------------------------------
    async submitProduct() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/admin/products",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Cocokkan mapping dengan yang diharapkan controller lu
            body: JSON.stringify({
              name: this.newProduct.name,
              category: this.newProduct.category,
              description: this.newProduct.description,
              short_description: this.newProduct.short_description,
              image_url: this.newProduct.image_url,
              variants: this.variants.map((v) => ({
                type: v.type,
                dur: v.dur,
                cost_price: v.cost,
                price: v.price,
              })),
            }),
          },
        );

        if (response.ok) {
          this.showToast(
            "Sukses!",
            "Data produk baru masuk database.",
            "success",
          );
          this.isModalOpen = false;

          // Reset form ke posisi awal
          this.newProduct = {
            name: "",
            category: "Streaming",
            short_description: "",
            description: "",
            image_url: "",
          };
          this.variants = [
            { type: "Sharing 1P1U", dur: "1 Bulan", cost: 0, price: 0 },
          ];

          // Refresh list produk
          await this.fetchInventory();
        } else {
          const errData = await response.json();
          this.showToast(
            "Gagal",
            errData.message || "Gagal masukin data.",
            "error",
          );
        }
      } catch (error) {
        this.showToast("Server Error", "Cek terminal backend lu bro.", "error");
        console.error("Error submit:", error);
      }
    },

    // -----------------------------------------------------------------
    // API: HAPUS PRODUK
    // -----------------------------------------------------------------
    async deleteProduct(id) {
      if (
        !confirm(
          "Yakin mau hapus produk ini bro? Semua varian dan stok akunnya juga bakal musnah loh!",
        )
      )
        return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/admin/products/${id}`,
          {
            method: "DELETE",
          },
        );

        if (response.ok) {
          this.showToast("Berhasil", "Produk berhasil dihapus!", "success");
          await this.fetchInventory(); // Refresh tabel otomatis
        } else {
          this.showToast("Gagal", "Gagal hapus produk.", "error");
        }
      } catch (error) {
        this.showToast("Error", "Server mati/error CORS.", "error");
        console.error(error);
      }
    },

    // -----------------------------------------------------------------
    // API: SUNTIK STOK BARU
    // -----------------------------------------------------------------
    async submitStock() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/admin/inventory",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.newStock),
          },
        );

        if (response.ok) {
          this.showToast("Mantap!", "Stok akun berhasil disuntik.", "success");
          this.isModalOpen = false;
          // Reset form restock
          this.newStock = { variant_id: "", accounts: "" };
          // Refresh tabel biar angkanya berubah
          await this.fetchInventory();
        } else {
          this.showToast("Gagal", "Format salah atau API error.", "error");
        }
      } catch (error) {
        this.showToast("Error", "Gagal menghubungi server.", "error");
        console.error("Error restock:", error);
      }
    },

    // -----------------------------------------------------------------
    // TOAST NOTIFICATION
    // -----------------------------------------------------------------
    showToast(title, msg, type = "success") {
      const toast = document.createElement("div");
      const iconColor = type === "success" ? "text-success" : "text-danger";
      const iconName = type === "success" ? "check-circle" : "alert-circle";

      toast.className = `bg-white p-4 rounded-2xl shadow-card border border-gray-100 flex items-start gap-4 transform transition-all duration-300 translate-x-10 opacity-0 min-w-[300px]`;
      toast.innerHTML = `
        <div class="mt-0.5"><i data-lucide="${iconName}" class="w-6 h-6 ${iconColor}"></i></div>
        <div>
            <h4 class="font-extrabold text-dark text-sm">${title}</h4>
            <p class="text-xs text-lightText font-medium mt-0.5">${msg}</p>
        </div>
      `;

      document.getElementById("toast-container").appendChild(toast);
      if (typeof lucide !== "undefined") lucide.createIcons({ root: toast });

      // Animate in
      requestAnimationFrame(() => {
        toast.classList.remove("translate-x-10", "opacity-0");
      });

      // Animate out and remove after 3s
      setTimeout(() => {
        toast.classList.add("translate-x-10", "opacity-0");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },
  }));
});

// ====================================================================================
// GLOBAL CHART LOGIC
// ====================================================================================
window.sChart = null;
window.cChart = null;

window.initCharts = function () {
  const sCanvas = document.getElementById("sessionsChart");
  if (sCanvas) {
    if (window.sChart) window.sChart.destroy();
    const ctx = sCanvas.getContext("2d");
    window.sChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["", "", "", "", "", "", ""],
        datasets: [
          {
            data: [0, 6, 2, 8, 2, 10, 16],
            borderColor: "#4318FF",
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false, grid: { display: false } },
          y: {
            display: true,
            beginAtZero: true,
            max: 18,
            border: { display: false },
            grid: { color: "#F4F7FE", drawTicks: false },
            ticks: {
              stepSize: 5,
              color: "#A3AED0",
              font: { weight: "bold", size: 10 },
              padding: 10,
            },
          },
        },
        layout: { padding: { left: -10, bottom: -10 } },
      },
    });
  }

  const cCanvas = document.getElementById("conversionChart");
  if (cCanvas) {
    if (window.cChart) window.cChart.destroy();
    const ctxC = cCanvas.getContext("2d");
    window.cChart = new Chart(ctxC, {
      type: "doughnut",
      data: {
        labels: ["Converted", "Remaining"],
        datasets: [
          {
            data: [58.19, 41.81],
            backgroundColor: ["#4318FF", "#F4F7FE"],
            borderWidth: 0,
            borderRadius: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        circumference: 180,
        rotation: 270,
        cutout: "75%",
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    });
  }
};
