import assert from 'node:assert/strict';
import test from 'node:test';
import { handleContact } from '../functions/api/contact.ts';

const origin = 'https://jakeardoincom.pages.dev';
const inquiry = { name: ' Example Client ', email: ' client@example.test ', service: '3D design & printing', message: ' A 30mm part & a bracket? #1 = “prototype” 🛠\nTwo pieces, please. ', website: '' };
const request = (body = inquiry, headers = {}) => new Request(`${origin}/api/contact`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Accept: 'application/json', ...headers }, body: JSON.stringify(body) });
const accepted = () => Promise.resolve(Response.json({ success: 'true', message: 'Email sent successfully' }));

test('delivers validated inquiry only to the fixed owner, preserving message and reply address', async () => {
  let calls = 0;
  const response = await handleContact(request({ ...inquiry, _cc: 'attacker@example.test', _webhook: 'https://example.test/' }), async (url, options) => {
    calls++;
    assert.equal(url, 'https://formsubmit.co/ajax/5b52001950c0cc4c66cae8abe3c605dd');
    assert.equal(options.redirect, 'manual', 'Inquiry data must not follow a provider redirect');
    const body = JSON.parse(options.body);
    assert.equal(body.message, inquiry.message.trim());
    assert.equal(body.name, 'Example Client');
    assert.equal(body.email, 'client@example.test');
    assert.equal(body._replyto, 'client@example.test');
    assert.equal(body._url, 'https://www.jakeardoin.com/');
    assert.equal(body._subject, 'Jake DevWorks inquiry: 3D design & printing');
    assert.ok(!('_cc' in body) && !('_webhook' in body) && !('_captcha' in body));
    return accepted();
  });
  assert.equal(calls, 1);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('rejects invalid fields and cross-origin submissions without contacting the provider', async () => {
  const noDelivery = () => { throw new Error('Must not send'); };
  for (const fields of [{ name: '' }, { email: 'invalid' }, { email: 'test@example.test\r\nBcc: other@example.test' }, { name: 'a'.repeat(101) }, { service: 'Something else' }, { message: ' ' }, { message: 'x'.repeat(5001) }, { name: 42 }]) {
    assert.equal((await handleContact(request({ ...inquiry, ...fields }), noDelivery)).status, 400);
  }
  assert.equal((await handleContact(request(inquiry, { Origin: 'https://other.example.test' }), noDelivery)).status, 403);
  assert.equal((await handleContact(request(inquiry, { Origin: 'null' }), noDelivery)).status, 403);
  assert.equal((await handleContact(new Request(`${origin}/api/contact`), noDelivery)).status, 405);
});

test('caps streamed payload size, handles malformed input, and drops honeypot spam', async () => {
  const noDelivery = () => { throw new Error('Must not send'); };
  assert.equal((await handleContact(request({ ...inquiry, message: 'x'.repeat(70000) }), noDelivery)).status, 413);
  const malformed = new Request(`${origin}/api/contact`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await handleContact(malformed, noDelivery)).status, 400);
  assert.equal((await handleContact(request({ ...inquiry, website: 'spam.example.test' }), noDelivery)).status, 200);
});

test('does not report delivery for HTTP errors, string false, activation, or network failures', async () => {
  for (const upstream of [() => Promise.resolve(Response.json({ success: 'false', message: 'Activation required' })), () => Promise.resolve(Response.json({ success: true, message: 'Please activate your form' })), () => Promise.resolve(new Response(null, { status: 302, headers: { Location: 'https://other.example.test/' } })), () => Promise.resolve(new Response('Unavailable', { status: 503 })), () => Promise.resolve(new Response('<html>Challenge</html>')), () => Promise.reject(new Error('Network failure'))]) {
    const response = await handleContact(request(), upstream);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, false);
  }
});

test('supports normal HTML form posts and returns a safe confirmation without JavaScript', async () => {
  const form = new URLSearchParams(inquiry);
  const req = new Request(`${origin}/api/contact`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/html' }, body: form });
  const response = await handleContact(req, accepted);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /text\/html/);
  const html = await response.text();
  assert.match(html, /Message sent/);
  assert.ok(!html.includes(inquiry.email.trim()));
});
