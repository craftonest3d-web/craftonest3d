/**
 * CRAFTONEST3D – Admin Categories
 * Add / Edit / Delete categories.
 */
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Modal } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import {
  getAllCategoriesAdmin, addCategory, updateCategory, deleteCategory,
} from '../../services/categoryService';
import type { Category } from '../../types';

type CatForm = Omit<Category, 'id'>;

const EMPTY_FORM: CatForm = {
  name: '', slug: '', icon: '', sortOrder: 0, isActive: true,
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [form,       setForm]       = useState<CatForm>({ ...EMPTY_FORM });
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [error,      setError]      = useState('');

  const load = () => {
    setLoading(true);
    getAllCategoriesAdmin().then((c) => { setCategories(c); setLoading(false); });
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, sortOrder: categories.length });
    setError('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    const { id: _id, ...rest } = cat;
    setForm({ ...rest });
    setError('');
    setShowModal(true);
  };

  const set = (key: keyof CatForm, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNameChange = (name: string) => {
    set('name', name);
    if (!editId) set('slug', slugify(name));   // auto-slug only on add
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editId) {
        await updateCategory(editId, { ...form });
      } else {
        await addCategory({ ...form });
      }
      setShowModal(false);
      load();
    } catch (err: unknown) {
      setError('Save failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    setDeleting(cat.id);
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Categories</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn btn-pink d-flex align-items-center gap-2"
          style={{ fontSize: '0.875rem' }}
        >
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm me-2" /> Loading…
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-5 text-muted">
          No categories yet. <button className="btn btn-link p-0" onClick={openAdd}>Add one →</button>
        </div>
      ) : (
        <Row className="g-3">
          {categories.map((cat) => (
            <Col xs={12} sm={6} md={4} lg={3} key={cat.id}>
              <div
                className="bg-white rounded-4 p-3 d-flex flex-column gap-2"
                style={{ border: '1px solid #f0f1f5', boxShadow: 'var(--pn-shadow-xs)' }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ width: 40, height: 40, backgroundColor: 'var(--pn-primary-bg)', fontSize: '1.2rem', flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    {cat.icon || '📦'}
                  </div>
                  <span
                    className="px-2 py-1 rounded-pill"
                    style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: cat.isActive ? '#e8f5e9' : '#fdecea', color: cat.isActive ? '#2e7d32' : '#c62828' }}
                  >
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div>
                  <p className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>{cat.name}</p>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                    slug: <code>{cat.slug}</code> · order: {cat.sortOrder}
                  </p>
                </div>

                <div className="d-flex gap-2 mt-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    style={{ backgroundColor: '#e3f2fd', color: '#0062cc', border: 'none', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={deleting === cat.id}
                    className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
                    style={{ backgroundColor: '#fdecea', color: '#c62828', border: 'none', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    {deleting === cat.id
                      ? <span className="spinner-border spinner-border-sm" />
                      : <><FiTrash2 size={12} /></>
                    }
                  </button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="sm">
        <Modal.Header className="border-0 pb-0">
          <Modal.Title as="h6" className="fw-bold">
            {editId ? 'Edit Category' : 'Add Category'}
          </Modal.Title>
          <button
            className="btn btn-sm border-0 ms-auto p-1"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="rounded-3 p-2 mb-3" style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.82rem' }}>
              ⚠️ {error}
            </div>
          )}
          <Form onSubmit={handleSave} noValidate>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Name *</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Notebooks"
                required
                style={{ height: 40 }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Slug *</Form.Label>
              <Form.Control
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="e.g. notebooks"
                required
                style={{ height: 40 }}
              />
              <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                URL-friendly identifier. Auto-filled from name.
              </Form.Text>
            </Form.Group>
            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Icon (emoji)</Form.Label>
                  <Form.Control
                    value={form.icon ?? ''}
                    onChange={(e) => set('icon', e.target.value)}
                    placeholder="📦"
                    style={{ height: 40 }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Sort Order</Form.Label>
                  <Form.Control
                    type="number" min={0}
                    value={form.sortOrder}
                    onChange={(e) => set('sortOrder', Number(e.target.value))}
                    style={{ height: 40 }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div
              className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-4"
              style={{ backgroundColor: form.isActive ? '#e8f5e9' : '#f5f6f8', cursor: 'pointer' }}
              onClick={() => set('isActive', !form.isActive)}
              role="checkbox"
              aria-checked={form.isActive}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && set('isActive', !form.isActive)}
            >
              <span className="fw-semibold" style={{ fontSize: '0.875rem', color: form.isActive ? '#2e7d32' : 'var(--pn-text-muted)' }}>
                {form.isActive ? '✓ Active (visible)' : 'Hidden'}
              </span>
              <div className="rounded-pill" style={{ width: 36, height: 20, backgroundColor: form.isActive ? '#4caf50' : '#e0e0e0', position: 'relative', transition: 'background-color 0.2s' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 2, left: form.isActive ? 18 : 2, transition: 'left 0.2s' }} />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-pink flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                disabled={saving}
                style={{ height: 42, fontSize: '0.875rem' }}
              >
                {saving
                  ? <><span className="spinner-border spinner-border-sm" /> Saving…</>
                  : <><FiSave size={14} /> {editId ? 'Save Changes' : 'Add Category'}</>
                }
              </button>
              <button
                type="button"
                className="btn border-0"
                style={{ backgroundColor: '#f0f1f5', color: 'var(--pn-text-dark)', height: 42 }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminCategories;
