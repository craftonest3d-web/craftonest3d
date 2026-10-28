/**
 * CRAFTONEST3D – Admin Orders
 * View order history, update status, log payments received, export to Excel (CSV).
 * Admin-login-only (route is inside the protected shell; reads are blocked by
 * firestore.rules for non-admins).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiTrash2, FiRefreshCw, FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';
import {
  subscribeToOrders, updateOrderStatus, updateOrderPayment, deleteOrder, downloadOrdersCsv,
  createOfflineOrder, updateOrderDates, updateOrderShipping,
} from '../../services/orderService';
import { normalizeIndianPhone, isValidTrackingUrl, buildWhatsAppUrl, buildShippingMessage } from '../../utils/whatsapp';
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
  const [showOffline, setShowOffline] = useState(false);
  const [off, setOff] = useState({ customerName: '', itemText: '', quantity: '1', amount: '', courier: '', paymentNote: '', status: 'completed' as OrderStatus, orderDate: new Date().toISOString().slice(0, 10), deliveryDate: '' });
  const [savingOff, setSavingOff] = useState(false);

  const lbl: React.CSSProperties = { fontSize: '0.74rem', color: '#5c677d', fontWeight: 600, display: 'block', marginBottom: 4 };
  const inp: React.CSSProperties = { width: '100%', height: 40, border: '1px solid #e3e6ec', borderRadius: 8, padding: '0 10px', fontSize: '0.85rem' };

  const submitOffline = async () => {
    if (!off.itemText.trim()) return;
    setSavingOff(true);
    try {
      await createOfflineOrder({
        customerName: off.customerName.trim(),
        itemText: off.itemText.trim(),
        quantity: Number(off.quantity) || 1,
        amount: Number(off.amount) || 0,
        courier: off.courier.trim(),
        paymentNote: off.paymentNote.trim(),
        status: off.status,
        orderDate: off.orderDate,
        deliveryDate: off.deliveryDate,
      });
      setOff({ customerName: '', itemText: '', quantity: '1', amount: '', courier: '', paymentNote: '', status: 'completed', orderDate: new Date().toISOString().slice(0, 10), deliveryDate: '' });
      setShowOffline(false);
    } finally {
      setSavingOff(false);
    }
  };

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

  // Accounts tally — online vs offline vs total (counts payment received where logged, else order total)
  const tally = useMemo(() => {
    const amt = (o: Order) => (o.paymentAmount ?? o.total ?? 0);
    let onlineAmt = 0, offlineAmt = 0, onlineCount = 0, offlineCount = 0;
    orders.forEach((o) => {
      if (o.status === 'cancelled') return; // don't count cancelled in revenue
      if (o.source === 'offline') { offlineAmt += amt(o); offlineCount++; }
      else { onlineAmt += amt(o); onlineCount++; }
    });
    return { onlineAmt, offlineAmt, totalAmt: onlineAmt + offlineAmt, onlineCount, offlineCount };
  }, [orders]);

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
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.74rem', fontWeight: 600 }}>
            <FiRefreshCw size={12} /> Live
          </span>
          <button
            onClick={() => setShowOffline((v) => !v)}
            className="btn btn-sm d-flex align-items-center gap-2"
            style={{ backgroundColor: '#ede7f6', color: '#5e35b1', border: 'none', fontWeight: 700, fontSize: '0.82rem', padding: '8px 14px', borderRadius: 8 }}
          >
            <FiPlus size={14} /> Add Offline Order
          </button>
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

      {/* Add Offline Order form */}
      {showOffline && (
        <div className="rounded-4 p-4 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #ece3f5' }}>
          <h6 className="fw-bold mb-3" style={{ color: '#5e35b1' }}>➕ Add Offline / In-Person Order</h6>
          <div className="row g-3">
            <div className="col-sm-6">
              <label style={lbl}>Customer Name</label>
              <input value={off.customerName} onChange={(e) => setOff({ ...off, customerName: e.target.value })} placeholder="e.g. Priya (walk-in)" style={inp} />
            </div>
            <div className="col-sm-6">
              <label style={lbl}>Item / Description *</label>
              <input value={off.itemText} onChange={(e) => setOff({ ...off, itemText: e.target.value })} placeholder="e.g. 2x Name Keychain - Aarav, Priya" style={inp} />
            </div>
            <div className="col-sm-3">
              <label style={lbl}>Quantity</label>
              <input type="number" min={1} value={off.quantity} onChange={(e) => setOff({ ...off, quantity: e.target.value })} style={inp} />
            </div>
            <div className="col-sm-3">
              <label style={lbl}>Amount (₹)</label>
              <input type="number" min={0} value={off.amount} onChange={(e) => setOff({ ...off, amount: e.target.value })} placeholder="0" style={inp} />
            </div>
            <div className="col-sm-6">
              <label style={lbl}>Status</label>
              <select value={off.status} onChange={(e) => setOff({ ...off, status: e.target.value as OrderStatus })} style={inp}>
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <label style={lbl}>Courier / Delivery Details</label>
              <input value={off.courier} onChange={(e) => setOff({ ...off, courier: e.target.value })} placeholder="e.g. DTDC AWB 12345, or Hand delivered" style={inp} />
            </div>
            <div className="col-sm-6">
              <label style={lbl}>Payment Note</label>
              <input value={off.paymentNote} onChange={(e) => setOff({ ...off, paymentNote: e.target.value })} placeholder="e.g. Cash / GPay, 22 Oct" style={inp} />
            </div>
            <div className="col-sm-6">
              <label style={lbl}>Order Date</label>
              <input type="date" value={off.orderDate} onChange={(e) => setOff({ ...off, orderDate: e.target.value })} style={inp} />
            </div>
            <div className="col-sm-6">
              <label style={lbl}>Delivery Date</label>
              <input type="date" value={off.deliveryDate} onChange={(e) => setOff({ ...off, deliveryDate: e.target.value })} style={inp} />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button onClick={submitOffline} disabled={savingOff || !off.itemText.trim()}
              className="btn btn-sm" style={{ backgroundColor: '#5e35b1', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', padding: '9px 18px', borderRadius: 8, opacity: (savingOff || !off.itemText.trim()) ? 0.6 : 1 }}>
              {savingOff ? 'Saving…' : 'Save Offline Order'}
            </button>
            <button onClick={() => setShowOffline(false)}
              className="btn btn-sm" style={{ backgroundColor: '#f0f1f5', color: '#333', border: 'none', fontWeight: 600, fontSize: '0.82rem', padding: '9px 18px', borderRadius: 8 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Accounts summary — online + offline tally in one shot */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-lg-3">
          <div className="px-3 py-2 rounded-3 h-100" style={{ backgroundColor: '#fff', border: '1px solid #f0f1f5' }}>
            <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>🌐 ONLINE</span>
            <p className="mb-0 fw-bold" style={{ fontSize: '1.05rem', color: '#1565c0' }}>{inr(tally.onlineAmt)}</p>
            <span style={{ fontSize: '0.68rem', color: '#9aa0a8' }}>{tally.onlineCount} orders</span>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="px-3 py-2 rounded-3 h-100" style={{ backgroundColor: '#fff', border: '1px solid #f0f1f5' }}>
            <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>🏪 OFFLINE</span>
            <p className="mb-0 fw-bold" style={{ fontSize: '1.05rem', color: '#5e35b1' }}>{inr(tally.offlineAmt)}</p>
            <span style={{ fontSize: '0.68rem', color: '#9aa0a8' }}>{tally.offlineCount} orders</span>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="px-3 py-2 rounded-3 h-100" style={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2e7d32' }}>💰 TOTAL REVENUE</span>
            <p className="mb-0 fw-bold" style={{ fontSize: '1.15rem', color: '#2e7d32' }}>{inr(tally.totalAmt)}</p>
            <span style={{ fontSize: '0.68rem', color: '#66996a' }}>online + offline</span>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="px-3 py-2 rounded-3 h-100" style={{ backgroundColor: '#fff', border: '1px solid #f0f1f5' }}>
            <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>📦 TOTAL ORDERS</span>
            <p className="mb-0 fw-bold" style={{ fontSize: '1.15rem', color: '#0a1128' }}>{orders.length}</p>
            <span style={{ fontSize: '0.68rem', color: '#9aa0a8' }}>excl. cancelled in revenue</span>
          </div>
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
                  {o.status === 'shipped' ? (
                    <span className="c3d-transit">
                      <span className="c3d-transit__move">🚚</span> In Transit
                    </span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: meta.bg, color: meta.fg, fontWeight: 700, fontSize: '0.7rem', padding: '5px 10px' }}>
                      {meta.label}
                    </span>
                  )}
                  {o.source === 'offline' && (
                    <span className="badge" style={{ backgroundColor: '#ede7f6', color: '#5e35b1', fontWeight: 700, fontSize: '0.64rem', padding: '4px 8px' }}>
                      🏪 Offline
                    </span>
                  )}
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

                    {/* Dates + Courier — editable */}
                    <DeliveryEditor order={o} />

                    {/* Shipping details + WhatsApp Click-to-Chat */}
                    <ShippingEditor order={o} />


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

// ── Delivery / dates sub-editor (editable after order exists) ────────────────
const DeliveryEditor: React.FC<{ order: Order }> = ({ order }) => {
  const [orderDate, setOrderDate]       = useState(order.orderDate ?? '');
  const [deliveryDate, setDeliveryDate] = useState(order.deliveryDate ?? '');
  const [courier, setCourier]           = useState(order.courier ?? '');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      await updateOrderDates(order.id, { orderDate, deliveryDate, courier });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch { /* snapshot re-syncs */ }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 38, border: '1px solid #e3e6ec', borderRadius: 8,
    padding: '0 10px', fontSize: '0.82rem',
  };

  return (
    <div className="pt-3">
      <p className="fw-semibold mb-2" style={{ fontSize: '0.78rem', color: '#5c677d', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        🚚 Delivery &amp; Dates
      </p>
      <div className="d-flex flex-wrap gap-2 align-items-end">
        <div style={{ flex: '1 1 130px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>Order date</label>
          <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 130px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>Delivery date</label>
          <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: '2 1 200px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>Courier / tracking</label>
          <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. DTDC AWB 12345" style={inputStyle} />
        </div>
        <button
          onClick={save}
          className="btn btn-sm"
          style={{ backgroundColor: saved ? '#2e7d32' : '#0a1128', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.78rem', padding: '8px 16px', borderRadius: 8, height: 38 }}
        >
          {saved ? '✓ Saved' : 'Save Dates'}
        </button>
      </div>
    </div>
  );
};

// ── Shipping sub-editor + WhatsApp Click-to-Chat (FREE, manual send) ─────────
const ShippingEditor: React.FC<{ order: Order }> = ({ order }) => {
  const [phone, setPhone]                   = useState(order.phone ?? '');
  const [courier, setCourier]               = useState(order.courier ?? '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '');
  const [trackingUrl, setTrackingUrl]       = useState(order.trackingUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 38, border: '1px solid #e3e6ec', borderRadius: 8,
    padding: '0 10px', fontSize: '0.82rem',
  };

  // Validity drives the WhatsApp button's disabled state.
  const phoneOk    = normalizeIndianPhone(phone) !== null;
  const urlOk      = trackingUrl.trim() !== '' && isValidTrackingUrl(trackingUrl);
  const trackingOk = trackingNumber.trim() !== '';
  const canNotify  = phoneOk && urlOk && trackingOk;

  const save = async () => {
    if (saving) return; // guard against double-submit
    setSaving(true);
    try {
      await updateOrderShipping(order.id, {
        phone: phone.trim(),
        courier: courier.trim(),
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch { /* snapshot re-syncs */ } finally {
      setSaving(false);
    }
  };

  const notifyOnWhatsApp = () => {
    const digits = normalizeIndianPhone(phone);
    if (!digits || !canNotify) return;
    const message = buildShippingMessage({
      customerName: order.customerName,
      orderRef: order.ref,
      courier: courier.trim(),
      trackingNumber: trackingNumber.trim(),
      trackingUrl: trackingUrl.trim(),
    });
    const url = buildWhatsAppUrl(digits, message);
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpened(true);
  };

  const copyLink = async () => {
    if (!urlOk) return;
    try {
      await navigator.clipboard.writeText(trackingUrl.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable — silently ignore */ }
  };

  return (
    <div className="pt-3">
      <p className="fw-semibold mb-2" style={{ fontSize: '0.78rem', color: '#5c677d', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        🚢 Shipping Details
      </p>
      <div className="d-flex flex-wrap gap-2 align-items-end">
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>Phone (customer)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 98765 43210" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>Courier</label>
          <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. DTDC" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>Tracking number</label>
          <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. AWB 12345" style={inputStyle} />
        </div>
        <div style={{ flex: '2 1 220px' }}>
          <label style={{ fontSize: '0.72rem', color: '#888' }}>Tracking URL</label>
          <input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://…" style={inputStyle} />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn btn-sm"
          style={{ backgroundColor: saved ? '#2e7d32' : '#0a1128', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.78rem', padding: '8px 16px', borderRadius: 8, height: 38, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Shipping Details'}
        </button>
      </div>

      {/* WhatsApp Click-to-Chat (manual send) */}
      <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
        <button
          onClick={notifyOnWhatsApp}
          disabled={!canNotify}
          className="btn btn-sm"
          style={{ backgroundColor: '#25d366', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.78rem', padding: '8px 16px', borderRadius: 8, height: 38, opacity: canNotify ? 1 : 0.5, cursor: canNotify ? 'pointer' : 'not-allowed' }}
        >
          💬 Send WhatsApp Tracking Details
        </button>
        <button
          onClick={copyLink}
          disabled={!urlOk}
          className="btn btn-sm"
          style={{ backgroundColor: copied ? '#2e7d32' : '#f0f1f5', color: copied ? '#fff' : '#333', border: 'none', fontWeight: 600, fontSize: '0.78rem', padding: '8px 16px', borderRadius: 8, height: 38, opacity: urlOk ? 1 : 0.5, cursor: urlOk ? 'pointer' : 'not-allowed' }}
        >
          {copied ? '✓ Copied' : '🔗 Copy Tracking Link'}
        </button>
      </div>

      {!canNotify && (
        <p className="mb-0 mt-2" style={{ fontSize: '0.72rem', color: '#c62828' }}>
          Enter a valid phone, tracking number, and http/https tracking URL to notify the customer.
        </p>
      )}

      <p className="mb-0 mt-2" style={{ fontSize: '0.72rem', color: '#5c677d' }}>
        Your shipping message will open in WhatsApp. Please review it and press Send to notify your customer.
      </p>

      {opened && (
        <p className="mb-0 mt-1" style={{ fontSize: '0.72rem', color: '#2e7d32' }}>
          WhatsApp opened — review and press Send.
        </p>
      )}
    </div>
  );
};

export default AdminOrders;
