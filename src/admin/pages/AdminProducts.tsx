/**
 * PaperNest – Admin Products List
 * Shows all products with edit / delete / toggle visibility actions.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSearch } from 'react-icons/fi';
import { getAllProducts, deleteProduct, updateProduct } from '../../services/productService';
import { deleteImageByUrl } from '../../services/storageService';
import type { Product } from '../../types';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAllProducts().then((p) => {
      setProducts(p);
      setFiltered(p);
      setLoading(false);
    });
  };

  useEffect(load, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? products.filter((p) => p.title.toLowerCase().includes(q) || p.categoryLabel.toLowerCase().includes(q))
        : products,
    );
  }, [search, products]);

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setDeleting(p.id);
    try {
      // Delete image from Storage if it is a Firebase Storage URL
      if (p.image && p.image.includes('firebasestorage')) {
        await deleteImageByUrl(p.image);
      }
      await deleteProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } finally {
      setDeleting(null);
    }
  };

  const toggleStock = async (p: Product) => {
    await updateProduct(p.id, { inStock: !p.inStock });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, inStock: !x.inStock } : x));
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Products</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            {products.length} product{products.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="btn btn-pink d-flex align-items-center gap-2"
          style={{ fontSize: '0.875rem' }}
        >
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5', boxShadow: 'var(--pn-shadow-xs)' }}>
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text border-end-0 bg-white">
            <FiSearch size={16} style={{ color: 'var(--pn-text-muted)' }} />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ height: 40 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-4" style={{ border: '1px solid #f0f1f5', boxShadow: 'var(--pn-shadow-xs)', overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm me-2" />
            Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {search ? `No products match "${search}".` : 'No products yet.'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
              <thead style={{ backgroundColor: '#fafbfc' }}>
                <tr style={{ color: 'var(--pn-text-muted)' }}>
                  <th className="border-0 fw-semibold py-3 ps-4">Product</th>
                  <th className="border-0 fw-semibold py-3">Category</th>
                  <th className="border-0 fw-semibold py-3">Price</th>
                  <th className="border-0 fw-semibold py-3">Badge</th>
                  <th className="border-0 fw-semibold py-3">Stock</th>
                  <th className="border-0 fw-semibold py-3">Featured</th>
                  <th className="border-0 fw-semibold py-3 pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderTop: '1px solid #f5f6f8' }}>
                    <td className="py-3 ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={p.image || 'https://via.placeholder.com/44'}
                          alt={p.title}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                        />
                        <div>
                          <p className="fw-semibold mb-0 text-truncate" style={{ maxWidth: 200 }}>{p.title}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>ID: {p.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{p.categoryLabel}</td>
                    <td>
                      <span className="fw-semibold">₹{p.price}</span>
                      {p.originalPrice > p.price && (
                        <span className="text-muted text-decoration-line-through ms-1" style={{ fontSize: '0.78rem' }}>
                          ₹{p.originalPrice}
                        </span>
                      )}
                    </td>
                    <td>
                      {p.badge ? (
                        <span
                          className="px-2 py-1 rounded-pill"
                          style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'var(--pn-primary-bg)', color: 'var(--pn-primary)' }}
                        >
                          {p.badge}
                        </span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleStock(p)}
                        className="btn btn-sm border-0 d-flex align-items-center gap-1 p-0"
                        style={{
                          fontSize: '0.78rem', fontWeight: 700,
                          color: p.inStock ? '#2e7d32' : '#c62828',
                        }}
                        title={p.inStock ? 'Click to mark out of stock' : 'Click to mark in stock'}
                      >
                        {p.inStock ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td>
                      <span
                        className="px-2 py-1 rounded-pill"
                        style={{
                          fontSize: '0.72rem', fontWeight: 700,
                          backgroundColor: p.isFeatured ? '#fff8e1' : '#f5f6f8',
                          color: p.isFeatured ? '#e65100' : '#9e9e9e',
                        }}
                      >
                        {p.isFeatured ? '★ Featured' : 'Normal'}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <Link
                          to={`/admin/products/${p.id}`}
                          className="btn btn-sm border-0 d-flex align-items-center gap-1"
                          style={{ backgroundColor: '#e3f2fd', color: '#0062cc', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          <FiEdit2 size={13} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleting === p.id}
                          className="btn btn-sm border-0 d-flex align-items-center gap-1"
                          style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          {deleting === p.id
                            ? <span className="spinner-border spinner-border-sm" />
                            : <><FiTrash2 size={13} /> Delete</>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
