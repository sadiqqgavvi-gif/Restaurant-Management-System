import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceOrder, TAX_RATE } from '../src/lib/pricing.js';

const menu = new Map([
  ['a', { _id: 'a', name: 'Burger', price: 19 }],
  ['b', { _id: 'b', name: 'Spritz', price: 13.5 }],
]);

test('prices come from the menu, not the request', () => {
  const { lines, subtotal } = priceOrder([{ id: 'a', quantity: 2, price: 0.01 }], menu);
  assert.equal(lines[0].price, 19);
  assert.equal(subtotal, 38);
});

test('adds 8% tax and rounds to cents', () => {
  const { subtotal, tax, total } = priceOrder([{ id: 'a', quantity: 1 }, { id: 'b', quantity: 3 }], menu);
  assert.equal(subtotal, 59.5);
  assert.equal(tax, Math.round(59.5 * TAX_RATE * 100) / 100);
  assert.equal(total, 64.26);
});

test('quantity defaults to 1', () => {
  assert.equal(priceOrder([{ id: 'b' }], menu).lines[0].quantity, 1);
});

test('rejects empty orders', () => {
  assert.throws(() => priceOrder([], menu), { status: 400, message: /at least one item/ });
  assert.throws(() => priceOrder(undefined, menu), { status: 400 });
});

test('rejects unknown or unavailable dishes', () => {
  assert.throws(() => priceOrder([{ id: 'zzz', quantity: 1 }], menu), { status: 400, message: /unavailable/ });
});

test('rejects zero, negative, fractional and huge quantities', () => {
  for (const quantity of [0, -2, 1.5, 51, 'lots']) {
    assert.throws(() => priceOrder([{ id: 'a', quantity }], menu), { status: 400 }, `quantity ${quantity}`);
  }
});
