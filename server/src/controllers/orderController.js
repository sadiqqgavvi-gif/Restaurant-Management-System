import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import { priceOrder } from '../lib/pricing.js';
import { orderEvents, publishOrder, openStream } from '../lib/events.js';

/** What a customer may see on the public tracking page — no phone, email or address. */
function publicView(order) {
  const o = order.toJSON ? order.toJSON() : order;
  return {
    _id: o._id,
    customerName: o.customer?.name?.split(' ')[0] ?? '',
    type: o.type,
    tableNumber: o.tableNumber,
    items: o.items.map(({ name, quantity, price }) => ({ name, quantity, price })),
    subtotal: o.subtotal,
    tax: o.tax,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export async function createOrder(req, res) {
  const { customer, items, type, tableNumber, notes } = req.body;
  const ids = Array.isArray(items) ? items.map((i) => i?.id).filter((id) => mongoose.isValidObjectId(id)) : [];
  const dishes = await MenuItem.find({ _id: { $in: ids }, available: true });
  const { lines, subtotal, tax, total } = priceOrder(items, new Map(dishes.map((d) => [String(d._id), d])));

  const order = await Order.create({ customer, type, tableNumber, notes, items: lines, subtotal, tax, total });
  publishOrder('created', order);
  res.status(201).json(order);
}

export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(publicView(order));
}

export async function listOrders(req, res) {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  res.json(await Order.find(filter).sort({ createdAt: -1 }).limit(200));
}

export async function updateOrderStatus(req, res) {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: 'after', runValidators: true }
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });
  publishOrder('updated', order);
  res.json(order);
}

/** Staff live feed: every new order and status change (Server-Sent Events). */
export function streamAllOrders(req, res) {
  const listener = (evt) => send('order', evt);
  const send = openStream(req, res, () => orderEvents.off('order', listener));
  orderEvents.on('order', listener);
  send('ready', { ok: true });
}

/** Customer live tracking: status changes for one order only. */
export async function streamOneOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const id = String(order._id);
  const listener = ({ order: o }) => {
    if (String(o._id) === id) send('status', publicView(o));
  };
  const send = openStream(req, res, () => orderEvents.off('order', listener));
  orderEvents.on('order', listener);
  send('status', publicView(order));
}
