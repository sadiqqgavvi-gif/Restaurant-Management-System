import { EventEmitter } from 'node:events';

/**
 * In-process event bus for order changes, streamed to browsers with Server-Sent Events.
 * (For several server instances you'd swap this for Redis pub/sub or MongoDB change streams.)
 */
export const orderEvents = new EventEmitter();
orderEvents.setMaxListeners(0); // one listener per open dashboard / tracking page

export function publishOrder(type, order) {
  orderEvents.emit('order', { type, order: order.toJSON ? order.toJSON() : order });
}

/** Opens an SSE response and returns a `send(event, data)` function. Cleans up on disconnect. */
export function openStream(req, res, onClose) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable proxy buffering (NGINX / Render)
  });
  res.write('retry: 3000\n\n');
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25_000);
  req.on('close', () => {
    clearInterval(heartbeat);
    onClose?.();
  });
  return (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}
