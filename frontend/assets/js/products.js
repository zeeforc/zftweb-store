const productModule = {
  async loadAll() {
    const res = await fetch(`${API_BASE}/api/products`);
    return await res.json();
  },
  async loadDetail(id) {
    const res = await fetch(`${API_BASE}/api/products/${id}`);
    return await res.json();
  },
};
