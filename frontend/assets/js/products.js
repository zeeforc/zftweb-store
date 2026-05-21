const productModule = {
  async loadAll() {
    const res = await fetch("http://localhost:3000/api/products");
    return await res.json();
  },
  async loadDetail(id) {
    const res = await fetch(`http://localhost:3000/api/products/${id}`);
    return await res.json();
  },
};
