import Reservation from '../models/Reservation.js';

export async function createReservation(req, res) {
  const { name, email, phone, date, time, guests, occasion, notes } = req.body;
  const day = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(day.getTime()) || day < today) {
    return res.status(400).json({ message: 'Please choose a valid future date' });
  }
  const reservation = await Reservation.create({ name, email, phone, date: day, time, guests, occasion, notes });
  res.status(201).json(reservation);
}

export async function listReservations(req, res) {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  res.json(await Reservation.find(filter).sort({ date: 1, time: 1 }).limit(200));
}

export async function updateReservationStatus(req, res) {
  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: 'after', runValidators: true }
  );
  if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
  res.json(reservation);
}
