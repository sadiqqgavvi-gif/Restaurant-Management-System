import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import request from 'supertest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_EMAIL = 'admin@test.dev';
process.env.ADMIN_PASSWORD = 'test-password';

let app;
let mongo;
let skip = false;

before(async () => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 90_000 } });
    await mongoose.connect(mongo.getUri('ember-test'));
  } catch (err) {
    // CI must run these; locally we allow skipping when MongoDB can't be downloaded/started.
    if (process.env.CI) throw err;
    skip = true;
    console.warn(`⚠️  Skipping API tests — MongoDB unavailable: ${err.message}`);
    return;
  }
  const { seedIfEmpty } = await import('../src/data/seed.js');
  await seedIfEmpty();
  ({ createApp: app } = await import('../src/app.js'));
  app = app();
});

after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

const login = async () =>
  (await request(app).post('/api/auth/login').send({ email: 'admin@test.dev', password: 'test-password' })).body.token;

test('GET /api/health', async (t) => {
  if (skip) return t.skip();
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('menu is seeded and filterable', async (t) => {
  if (skip) return t.skip();
  const all = await request(app).get('/api/menu');
  assert.equal(all.status, 200);
  assert.ok(all.body.length >= 10);
  const featured = await request(app).get('/api/menu?featured=true');
  assert.ok(featured.body.length > 0 && featured.body.every((d) => d.featured));
});

test('order totals are computed on the server and the public view hides contact details', async (t) => {
  if (skip) return t.skip();
  const [dish] = (await request(app).get('/api/menu')).body;
  const res = await request(app)
    .post('/api/orders')
    .send({ customer: { name: 'Ada Lovelace', phone: '555-0100' }, type: 'takeaway', items: [{ id: dish._id, quantity: 2, price: 0 }] });
  assert.equal(res.status, 201);
  assert.equal(res.body.subtotal, dish.price * 2);
  assert.equal(res.body.status, 'pending');

  const pub = await request(app).get(`/api/orders/${res.body._id}`);
  assert.equal(pub.status, 200);
  assert.equal(pub.body.customerName, 'Ada');
  assert.equal(pub.body.customer, undefined);
  assert.ok(!JSON.stringify(pub.body).includes('555-0100'));
});

test('orders with unknown dishes are rejected', async (t) => {
  if (skip) return t.skip();
  const res = await request(app)
    .post('/api/orders')
    .send({ customer: { name: 'X', phone: '1' }, items: [{ id: new mongoose.Types.ObjectId(), quantity: 1 }] });
  assert.equal(res.status, 400);
});

test('reservations validate the date', async (t) => {
  if (skip) return t.skip();
  const base = { name: 'Grace', email: 'g@x.dev', phone: '1', time: '19:00', guests: 2 };
  const past = await request(app).post('/api/reservations').send({ ...base, date: '2001-01-01' });
  assert.equal(past.status, 400);
  const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const ok = await request(app).post('/api/reservations').send({ ...base, date: future });
  assert.equal(ok.status, 201);
});

test('staff routes need a token; admin can list orders and update status', async (t) => {
  if (skip) return t.skip();
  assert.equal((await request(app).get('/api/orders')).status, 401);
  assert.equal((await request(app).post('/api/auth/login').send({ email: 'admin@test.dev', password: 'nope' })).status, 401);

  const token = await login();
  const list = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
  assert.equal(list.status, 200);
  assert.ok(list.body.length >= 1);

  const id = list.body[0]._id;
  const upd = await request(app).patch(`/api/orders/${id}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'preparing' });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.status, 'preparing');

  const bad = await request(app).patch(`/api/orders/${id}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'teleported' });
  assert.equal(bad.status, 400);

  const stats = await request(app).get('/api/stats').set('Authorization', `Bearer ${token}`);
  assert.equal(stats.status, 200);
  assert.ok(stats.body.revenue > 0);
});

test('live tracking stream pushes status changes (Server-Sent Events)', async (t) => {
  if (skip) return t.skip();
  const [dish] = (await request(app).get('/api/menu')).body;
  const order = (await request(app).post('/api/orders').send({ customer: { name: 'Lin', phone: '2' }, items: [{ id: dish._id, quantity: 1 }] })).body;
  const token = await login();

  const server = http.createServer(app).listen(0);
  const { port } = server.address();
  const events = [];
  const done = new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/api/orders/${order._id}/stream`, (res) => {
      assert.equal(res.headers['content-type'], 'text/event-stream');
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        for (const block of chunk.split('\n\n')) {
          const data = block.split('\n').find((l) => l.startsWith('data: '));
          if (data) events.push(JSON.parse(data.slice(6)).status);
        }
        if (events.includes('ready')) {
          req.destroy();
          resolve();
        }
      });
    });
    req.on('error', (e) => (e.code === 'ECONNRESET' ? null : reject(e)));
    setTimeout(() => reject(new Error(`timed out, got: ${events}`)), 5000);
  });

  // once the stream has delivered the initial status, move the order forward
  await new Promise((r) => setTimeout(r, 200));
  await request(app).patch(`/api/orders/${order._id}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'ready' });
  await done;
  server.close();
  assert.deepEqual(events, ['pending', 'ready']);
});
