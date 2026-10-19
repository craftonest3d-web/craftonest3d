/**
 * CRAFTONEST3D – Admin Orders
 * View order history, update status, log payments received, export to Excel (CSV).
 * Admin-login-only (route is inside the protected shell; reads are blocked by
 * firestore.rules for non-admins).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiTrash2, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import {
  subscribeToOrders, updateOrderStatus, updateOrderPayment, deleteOrder, downloadOrdersCsv,
} from '../../services/orderService';
import type { Order, OrderStatus } from '../../types';

const STATUS_META: Record<OrderStatus, { label: string; bg: string; fg: string }> = {
  pending:   { label: 'Pending',   bg: '#fff8e1', fg: '#e65100' },
  confirmed: { label: 'Confirmed', bg: '#e3f2fd', fg: '#1565c0' },
  paid:      { label: 'Paid',      bg: '#e8f5e9', fg: '#2e7d32' },
  shipped:   { label: 'Shipped',   bg: '#ede7f6', fg: '#5e35b1' },
  completed: { label: 'Completed', bg: '#e0f2f1', fg: '#00695c' },
  cancelled: { label: 'Cancelled', bg: '#fdecea', fg: '#c62828' },
};
const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'paid', 'shipped', 'completed', 'cancelled'];

const AdminOrders: React.FC = () => {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState<OrderStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToOrders((o) => {
      setOrders(o);
      setLoading(false);
      setError('');
    });
    return unsub;
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  const revenue = useMemo(
    () => orders.reduce((s, o) => s + (o.paymentAmount ?? 0), 0),
    [orders],
  );

  const changeStatus = async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    // Live subscription re-syncs automatically on success or failure.
    try { await updateOrderStatus(id, status); } catch { /* snapshot will correct */ }
  };

  const savePayment = async (
    id: string,
    payment: { paymentAmount?: number; paymentRef?: string; paymentNote?: string },
  ) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...payment } : o)));
    try { await updateOrderPayment(id, payment); } catch { /* snapshot will correct */ }
  };

  const removeOrder = async (id: string) => {
    if (!confirm('Delete this order permanently? This cannot be undone.')) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    try { await deleteOrder(id); } catch { /* snapshot will correct */ }
  };

  const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Orders</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            Order history &amp; payments — only you can see this.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.74rem', fontWeight: 600 }}>
            <FiRefreshCw size={12} /> Live
          </span>
          <button
            onClick={() => downloadOrdersCsv(filter === 'all' ? orders : visible)}
            disabled={visible.length === 0}
            className="btn btn-sm d-flex align-items-center gap-2"
            style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', padding: '8px 16px', borderRadius: 8, opacity: visible.length === 0 ? 0.5 : 1 }}
          >
            <FiDownload size={14} /> Export to Excel
          </button>
        </div>
      </div>

      {/* Stat chips */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="px-3 py-2 rounded-3" style={{ backgroundColor: '#fff', border: '1px solid #f0f1f5' }}>
          <span className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600 }}>TOTAL ORDERS</span>
          <p className="mb-0 fw-bold" style={{ fontSize: '1.1rem' }}>{orders.length}</p>
        </div>
        <div className="px-3 py-2 rounded-3" style={{ backgroundColor: '#fff', border: '1px solid #f0f1f5' }}>
          <span className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600 }}>PAYMENTS RECEIVED</span>
          <p className="mb-0 fw-bold" style={{ fontSize: '1.1rem', color: '#2e7d32' }}>{inr(revenue)}</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {(['all', ...STATUS_ORDER] as const).map((s) => {
          const active = filter === s;
          const meta = s === 'all' ? null : STATUS_META[s];
          const count = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="btn btn-sm"
              style={{
                backgroundColor: active ? '#0a1128' : (meta?.bg ?? '#f0f1f5'),
                color: active ? '#fff' : (meta?.fg ?? '#333'),
                border: 'none', fontWeight: 700, fontSize: '0.76rem',
                padding: '5px 12px', borderRadius: 20,
              }}
            >
              {s === 'all' ? 'All' : meta!.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm me-2" /> Loading orders…
        </div>
      ) : error ? (
        <div className="rounded-4 p-4" style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-4 p-5 text-center" style={{ backgroundColor: '#fff', border: '1px solid #f0f1f5' }}>
          <p className="mb-1 fw-bold" style={{ color: '#5c677d' }}>No orders yet</p>
          <p className="text-muted mb-0" style={{ fontSize: '0.82rem' }}>
            Orders appear here automatically when a customer places one from the shop.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {visible.map((o) => {
            const isOpen = expanded === o.id;
            const meta = STATUS_META[o.status];
            return (
              <div key={o.id} className="rounded-4" style={{ backgroundColor: '#fff', border: '1px solid #f0f1f5', overflow: 'hidden' }}>
                {/* Row header */}
                <div
                  className="d-flex flex-wrap align-items-center gap-3 p-3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                >
                  <span className="fw-bold" style={{ fontSize: '0.85rem', color: '#0a1128', minWidth: 72 }}>{o.ref}</span>
                  <span className="badge" style={{ backgroundColor: meta.bg, color: meta.fg, fontWeight: 700, fontSize: '0.7rem', padding: '5px 10px' }}>
                    {meta.label}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#333', flex: 1, minWidth: 120 }}>
                    {o.customerName}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.76rem' }}>
                    {o.itemCount} pc{o.itemCount !== 1 ? 's' : ''}
                  </span>
                  <span className="fw-bold" style={{ fontSize: '0.9rem', color: '#0a1128' }}>
                    {o.total > 0 ? inr(o.total) : 'Quote'}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.72rem', minWidth: 120, textAlign: 'right' }}>
                    {o.createdAt ? o.createdAt.toLocaleDateString('en-IN') : ''}
                  </span>
                  {isOpen ? <FiChevronUp size={16} color="#888" /> : <FiChevronDown size={16} color="#888" />}
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-3 pb-3" style={{ borderTop: '1px solid #f4f5f7' }}>
                    {/* Items */}
                    <div className="pt-3">
                      <p className="fw-semibold mb-2" style={{ fontSize: '0.78rem', color: '#5c677d', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Items</p>
                      {o.items.map((it, i) => (
                        <div key={i} className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#f8f9fc' }}>
                          <div className="d-flex justify-content-between">
                            <span className="fw-semibold" style={{ fontSize: '0.82rem' }}>{it.quantity}× {it.title}</span>
                            <span style={{ fontSize: '0.82rem', color: '#333' }}>{it.lineTotal > 0 ? inr(it.lineTotal) : 'Quote'}</span>
                          </div>
                          {Object.entries(it.options).filter(([, v]) => v).length > 0 && (
                            <div className="mt-1" style={{ fontSize: '0.74rem', color: '#777' }}>
                              {Object.entries(it.options).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Status buttons */}
                    <div className="pt-2">
                      <p className="fw-semibold mb-2" style={{ fontSize: '0.78rem', color: '#5c677d', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Status</p>
                      <div className="d-flex flex-wrap gap-2">
                        {STATUS_ORDER.map((s) => (
                          <button
                            key={s}
                            onClick={() => changeStatus(o.id, s)}
                            className="btn btn-sm"
                            style={{
                              backgroundColor: o.status === s ? STATUS_META[s].fg : STATUS_META[s].bg,
                              color: o.status === s ? '#fff' : STATUS_META[s].fg,
                              border: 'none', fontWeight: 700, fontSize: '0.72rem', padding: '4px 11px', borderRadius: 7,
                            }}
                          >
                            {STATUS_META[s].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment logging */}
                    <PaymentEditor order={o} onSave={savePayment} inr={inr} />

                    {/* Delete */}
                    <div className="pt-3 d-flex justify-content-end">
                      <button
                        onClick={() => removeOrder(o.id)}
                        className="btn btn-sm d-flex align-items-center gap-1"
                        style={{ backgroundColor: 'transparent', color: '#c62828', border: '1px solid #f3cfcc', fontWeight: 600, fontSize: '0.74rem', padding: '5px 12px', borderRadius: 7 }}
                      >
                        <FiTrash2 size={12} /> Delete order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Payment sub-editor ───────────────────────────────────────────────────────
const PaymentEditor: React.FC<{
  order: Order;
  onSave: (id: string, p: { paymentAmount?: number; paymentRef?: string; paymentNote?: string }) => void;
  inr: (n: number) => string;
}> = ({ order, onSave }) => {
  const [amount, setAmount] = useState(order.paymentAmount != null ? String(order.paymentAmount) : '');
  const [ref,    setRef]    = useState(order.paymentRef ?? '');
  const [note,   setNote]   = useState(order.paymentNote ?? '');
  const [saved,  setSaved]  = useState(false);

  const save = () => {
    onSave(order.id, {
      paymentAmount: amount.trim() === '' ? undefined : Number(amount),
      paymentRef:    ref.trim(),
      paymentNote:   note.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 38, border: '1px solid #e3e6ec', borderRadius: 8,
    padding: '0 10px', fontSize: '0.82rem',
  };

  return (
    <div className="pt-3">
      <p className="fw-semibold mb-2" style={{ fontSize: '0.78rem', color: '#5c677d', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        Payment received
      </p>
      <div className="d-flex flex-wrap gap-2 align-items-end">
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>Amount (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>UPI / Txn Ref</label>
          <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. 4231..." style={inputStyle} />
        </div>
        <div style={{ flex: '2 1 200px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>Note (date / method)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. GPay, 18 Oct" style={inputStyle} />
        </div>
        <button
          onClick={save}
          className="btn btn-sm"
          style={{ backgroundColor: saved ? '#2e7d32' : '#0a1128', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.78rem', padding: '8px 16px', borderRadius: 8, height: 38 }}
        >
          {saved ? '✓ Saved' : 'Save Payment'}
        </button>
      </div>
    </div>
  );
};

export default AdminOrders;
