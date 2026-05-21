const adminModule = {
  isModalOpen: false,
  newProduct: { name: "", category: "", price: 0 },

  async submitProduct() {
    console.log("Produk dikirim ke database...");
  },

  async fetchInventory() {
    const res = await fetch(API_BASE + "/api/admin/inventory");
    return await res.json();
  },
};
