/**
 * CRAFTONEST3D – Order Service
 * Collection: "orders"
 *
 * Customers may only CREATE an order (enforced in firestore.rules).
 * Reading, updating status/payment, deleting and exporting are admin-only.
 */
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, Timestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Order, OrderItem, OrderStatus } from '../types';

const COL = 'orders';

/** Short readable reference like "CN-9F3A2" */
function makeRef(): string {
  return 'CN-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function toOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    ref:           (data.ref           as string) ?? '',
    customerName:  (data.customerName  as string) ?? '',
    items:         (data.items         as OrderItem[]) ?? [],
    total:         (data.total         as number) ?? 0,
    itemCount:     (data.itemCount     as number) ?? 0,
    source:        (data.source        as Order['source']) ?? 'single',
    status:        (data.status        as OrderStatus) ?? 'pending',
    courier:       (data.courier       as string | undefined),
    paymentAmount: (data.paymentAmount as number | undefined),
    paymentRef:    (data.paymentRef    as string | undefined),
    paymentNote:   (data.paymentNote   as string | undefined),
    createdAt:     data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
  };
}

/** Called from the shop when a customer taps Order. Fire-and-forget. */
export async function createOrder(input: {
  customerName: string;
  items: OrderItem[];
  source: Order['source'];
}): Promise<string | null> {
  try {
    const total     = input.items.reduce((s, i) => s + (i.lineTotal || 0), 0);
    const itemCount = input.items.reduce((s, i) => s + (i.quantity || 0), 0);
    const ref = await addDoc(collection(db, COL), {
      ref:          makeRef(),
      customerName: input.customerName || '(not provided)',
      items:        input.items,
      total,
      itemCount,
      source:       input.source,
      status:       'pending' as OrderStatus,
      createdAt:    serverTimestamp(),
    });
    return ref.id;
  } catch {
    // Never block the customer's WhatsApp flow if saving fails.
    return null;
  }
}

/** Admin-added offline / in-person order. Admin-authenticated. */
export async function createOfflineOrder(input: {
  customerName: string;
  itemText: string;
  quantity: number;
  amount: number;
  courier?: string;
  paymentNote?: string;
  status?: OrderStatus;
}): Promise<string> {
  const items: OrderItem[] = [{
    title: input.itemText || 'Offline order',
    quantity: input.quantity || 1,
    unitPrice: input.quantity > 0 ? Math.round((input.amount || 0) / input.quantity) : (input.amount || 0),
    lineTotal: input.amount || 0,
    options: {},
  }];
  const clean: Record<string, unknown> = {
    ref: makeRef(),
    customerName: input.customerName || '(walk-in)',
    items,
    total: input.amount || 0,
    itemCount: input.quantity || 1,
    source: 'offline' as const,
    status: input.status ?? 'completed',
    createdAt: serverTimestamp(),
  };
  if (input.courier)     clean.courier = input.courier;
  if (input.paymentNote) clean.paymentNote = input.paymentNote;
  if (input.amount)      clean.paymentAmount = input.amount;
  const ref = await addDoc(collection(db, COL), clean);
  return ref.id;
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => toOrder(d.id, d.data() as Record<string, unknown>));
  } catch {
    // Fallback without index/order
    const snap = await getDocs(collection(db, COL));
    return snap.docs
      .map((d) => toOrder(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }
}

/** Live subscription — fires immediately and on every change. Returns unsubscribe. */
export function subscribeToOrders(cb: (orders: Order[]) => void): () => void {
  return onSnapshot(
    query(collection(db, COL), orderBy('createdAt', 'desc')),
    (snap) => cb(snap.docs.map((d) => toOrder(d.id, d.data() as Record<string, unknown>))),
    () => {
      // Fallback without ordering if the index/order errors
      getDocs(collection(db, COL)).then((snap) =>
        cb(
          snap.docs
            .map((d) => toOrder(d.id, d.data() as Record<string, unknown>))
            .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)),
        ),
      );
    },
  );
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, COL, id), { status });
}

export async function updateOrderPayment(
  id: string,
  payment: { paymentAmount?: number; paymentRef?: string; paymentNote?: string },
): Promise<void> {
  const clean: Record<string, unknown> = {};
  if (payment.paymentAmount !== undefined) clean.paymentAmount = payment.paymentAmount;
  if (payment.paymentRef    !== undefined) clean.paymentRef    = payment.paymentRef;
  if (payment.paymentNote   !== undefined) clean.paymentNote   = payment.paymentNote;
  await updateDoc(doc(db, COL, id), clean);
}

export async function deleteOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

// ── CSV export (opens cleanly in Excel) ──────────────────────────────────────

function csvCell(v: unknown): string {
  const s = String(v ?? '');
  // Escape quotes, wrap in quotes if it contains comma/quote/newline
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function ordersToCsv(orders: Order[]): string {
  const headers = [
    'Ref', 'Date', 'Source', 'Customer', 'Status', 'Items', 'Pieces',
    'Order Total (Rs)', 'Payment Received (Rs)', 'Payment Ref', 'Payment Note', 'Courier',
  ];
  const rows = orders.map((o) => {
    const itemsText = o.items
      .map((i) => {
        const opts = Object.entries(i.options)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ');
        return `${i.quantity}x ${i.title}${opts ? ` (${opts})` : ''} = Rs ${i.lineTotal}`;
      })
      .join(' | ');
    return [
      o.ref,
      o.createdAt ? o.createdAt.toLocaleString('en-IN') : '',
      o.source,
      o.customerName,
      o.status,
      itemsText,
      o.itemCount,
      o.total || 0,
      o.paymentAmount ?? '',
      o.paymentRef ?? '',
      o.paymentNote ?? '',
      o.courier ?? '',
    ].map(csvCell).join(',');
  });
  return [headers.map(csvCell).join(','), ...rows].join('\r\n');
}

export function downloadOrdersCsv(orders: Order[]): void {
  const csv = ordersToCsv(orders);
  // UTF-8 BOM so Excel reads ₹/accents and columns correctly
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `craftonest3d-orders-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
