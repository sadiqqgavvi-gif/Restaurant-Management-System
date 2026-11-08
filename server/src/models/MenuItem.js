import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, maxlength: 400 },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['starters', 'mains', 'grill', 'desserts', 'drinks'],
    },
    image: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    spicy: { type: Number, min: 0, max: 3, default: 0 },
    featured: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 4.8 },
    accent: { type: String, default: '#f59e0b' },
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
