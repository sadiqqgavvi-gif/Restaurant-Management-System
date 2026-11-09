import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';
import * as menu from '../controllers/menuController.js';
import * as orders from '../controllers/orderController.js';
import * as reservations from '../controllers/reservationController.js';
import * as auth from '../controllers/authController.js';
import { getStats } from '../controllers/statsController.js';

const router = Router();
const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Auth
router.post('/auth/login', loginLimiter, auth.login);
router.get('/auth/me', protect, auth.me);

// Menu (public read, admin write)
router.get('/menu', optionalAuth, menu.listMenu);
router.get('/menu/:id', menu.getMenuItem);
router.post('/menu', protect, adminOnly, menu.createMenuItem);
router.put('/menu/:id', protect, adminOnly, menu.updateMenuItem);
router.delete('/menu/:id', protect, adminOnly, menu.deleteMenuItem);

// Orders
router.post('/orders', writeLimiter, orders.createOrder);
router.get('/orders', protect, orders.listOrders);
router.get('/orders/stream', protect, orders.streamAllOrders); // staff live feed (SSE)
router.get('/orders/:id', orders.getOrder); // public tracking view
router.get('/orders/:id/stream', orders.streamOneOrder); // public live status (SSE)
router.patch('/orders/:id/status', protect, orders.updateOrderStatus);

// Reservations
router.post('/reservations', writeLimiter, reservations.createReservation);
router.get('/reservations', protect, reservations.listReservations);
router.patch('/reservations/:id/status', protect, reservations.updateReservationStatus);

// Dashboard
router.get('/stats', protect, getStats);

export default router;
