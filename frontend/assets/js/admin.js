const adminModule = {
  isModalOpen: false,
  newProduct: { name: "", category: "", price: 0 },

  async submitProduct() {
    // Logic fetch POST /api/admin/products
    console.log("Produk dikirim ke database...");
  },

  async fetchInventory() {
    const res = await fetch("http://localhost:3000/api/admin/inventory");
    return await res.json();
  },
};
