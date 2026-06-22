import { useState, useEffect, type FormEvent } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from "../api/products";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [editing, setEditing] = useState<number | null>(null);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const product = { name, description: description || undefined, price: Number(price) };

    if (editing !== null) {
      await updateProduct(editing, product);
      setEditing(null);
    } else {
      await createProduct(product);
    }

    setName("");
    setDescription("");
    setPrice("");
    loadProducts();
  };

  const handleEdit = (p: Product) => {
    setName(p.name);
    setDescription(p.description || "");
    setPrice(String(p.price));
    setEditing(p.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this product?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  return (
    <div className="products-page">
      <h1>Products</h1>

      <form onSubmit={handleSubmit} className="product-form">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button type="submit">{editing !== null ? "Update" : "Create"}</button>
        {editing !== null && (
          <button type="button" onClick={() => { setEditing(null); setName(""); setDescription(""); setPrice(""); }}>
            Cancel
          </button>
        )}
      </form>

      <div className="product-list">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p className="price">${p.price.toFixed(2)}</p>
            <div className="actions">
              <button onClick={() => handleEdit(p)}>Edit</button>
              <button onClick={() => handleDelete(p.id)} className="danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
