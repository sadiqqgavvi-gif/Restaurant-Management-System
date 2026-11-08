import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    guests: { type: Number, required: true, min: 1, max: 20 },
    occasion: { type: String, default: 'none' },
    notes: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Reservation', reservationSchema);
