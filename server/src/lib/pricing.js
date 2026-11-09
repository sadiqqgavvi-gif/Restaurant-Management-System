export const TAX_RATE = 0.08;
export const MAX_QTY = 50;

const round = (n) => Math.round(n * 100) / 100;

/**
 * Builds priced order lines from what the client asked for and what the database says.
 * Prices always come from the database, never from the request.
 *
 * @param {{id: string, quantity: number}[]} requested
 * @param {Map<string, {_id: any, name: string, price: number}>} menuById available dishes
 * @returns {{ lines: object[], subtotal: number, tax: number, total: number }}
 * @throws {Error} with `.status = 400` for unknown/unavailable items or bad quantities
 */
export function priceOrder(requested, menuById) {
  if (!Array.isArray(requested) || requested.length === 0) {
    throw Object.assign(new Error('Order must contain at least one item'), { status: 400 });
  }

  const lines = requested.map(({ id, quantity }) => {
    const dish = menuById.get(String(id));
    if (!dish) throw Object.assign(new Error(`Item unavailable: ${id}`), { status: 400 });
    const qty = Number(quantity ?? 1);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      throw Object.assign(new Error(`Invalid quantity for ${dish.name}`), { status: 400 });
    }
    return { menuItem: dish._id, name: dish.name, price: dish.price, quantity: qty };
  });

  const subtotal = round(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const tax = round(subtotal * TAX_RATE);
  return { lines, subtotal, tax, total: round(subtotal + tax) };
}
