import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import MenuItem from '../models/MenuItem.js';

export async function getStats(req, res) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [revenue, ordersToday, activeOrders, upcoming, menuCount, topItems] = await Promise.all([
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.countDocuments({ status: { $in: ['pending', 'preparing', 'ready'] } }),
    Reservation.countDocuments({ date: { $gte: startOfDay }, status: { $in: ['pending', 'confirmed'] } }),
    MenuItem.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', sold: { $sum: '$items.quantity' } } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.json({
    revenue: revenue[0]?.total ?? 0,
    ordersToday,
    activeOrders,
    upcomingReservations: upcoming,
    menuCount,
    topItems: topItems.map((t) => ({ name: t._id, sold: t.sold })),
  });
}
