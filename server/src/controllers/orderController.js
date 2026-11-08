import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';

const TAX_RATE = 0.08;
const round = (n) => Math.round(n * 100) / 100;

export async function createOrder(req, res) {
  const { customer, items, type, tableNumber, notes } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item' });
  }

  // Prices always come from the database, never from the client.
  const ids = items.map((i) => i.id);
  const dbItems = await MenuItem.find({ _id: { $in: ids }, available: true });
  const byId = new Map(dbItems.map((d) => [String(d._id), d]));

  const lines = [];
  for (const { id, quantity } of items) {
    const found = byId.get(String(id));
    if (!found) return res.status(400).json({ message: `Item unavailable: ${id}` });
    lines.push({ menuItem: found._id, name: found.name, price: found.price, quantity: Number(quantity) || 1 });
  }

  const subtotal = round(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const tax = round(subtotal * TAX_RATE);
  const order = await Order.create({
    customer, type, tableNumber, notes,
    items: lines, subtotal, tax, total: round(subtotal + tax),
  });
  res.status(201).json(order);
}

export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
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
  res.json(order);
}
