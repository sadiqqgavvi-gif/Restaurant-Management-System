import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authorised' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id);
    if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only' });

/** Attaches req.user when a valid token is present, but never blocks the request. */
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(payload.id);
  } catch {
    /* treat as anonymous */
  }
  next();
}
