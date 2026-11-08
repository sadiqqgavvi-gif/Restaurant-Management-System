import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(String(password)))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export function me(req, res) {
  const { _id, name, email, role } = req.user;
  res.json({ id: _id, name, email, role });
}
