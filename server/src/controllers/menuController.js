import MenuItem from '../models/MenuItem.js';

const EDITABLE = ['name', 'description', 'price', 'category', 'image', 'tags', 'spicy', 'featured', 'available', 'rating', 'accent'];
const pick = (body) => Object.fromEntries(EDITABLE.filter((k) => k in body).map((k) => [k, body[k]]));

export async function listMenu(req, res) {
  const { category, featured, q } = req.query;
  const filter = {};
  if (!req.user) filter.available = true;
  if (category && category !== 'all') filter.category = String(category);
  if (featured === 'true') filter.featured = true;
  if (q) filter.name = { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  res.json(await MenuItem.find(filter).sort({ category: 1, price: 1 }));
}

export async function getMenuItem(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  res.json(item);
}

export async function createMenuItem(req, res) {
  res.status(201).json(await MenuItem.create(pick(req.body)));
}

export async function updateMenuItem(req, res) {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, pick(req.body), { returnDocument: 'after', runValidators: true });
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  res.json(item);
}

export async function deleteMenuItem(req, res) {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  res.json({ message: 'Deleted' });
}
