import assert from 'node:assert/strict';
import test from 'node:test';
import { contactDelivery, submitContact } from '../src/lib/contact.ts';

const inquiry = { name: ' Example Client ', email: ' client@example.test ', service: '3D design & printing', message: ' A 30mm part & a bracket? #1 = “prototype” 🛠\nTwo pieces, please. ', _honey: '' };
const form = (overrides = {}) => {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...inquiry, ...overrides })) data.set(key, value);
  return data;
};

test('submits directly to the approved provider alias with only intended fields', async () => {
  let calls = 0;
  await submitContact(form({ _cc: 'attacker@example.test', _webhook: 'https://example.test/' }), async (url, options) => {
    calls++;
    assert.equal(url, 'https://formsubmit.co/ajax/5b52001950c0cc4c66cae8abe3c605dd');
    assert.equal(options.method, 'POST');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Accept, 'application/json');
    assert.ok(!('Content-Type' in options.headers), 'URLSearchParams supplies a browser-simple form content type');
    const body = options.body;
    assert.ok(body instanceof URLSearchParams);
    assert.equal(body.get('name'), 'Example Client');
    assert.equal(body.get('message'), inquiry.message.trim());
    assert.equal(body.get('email'), 'client@example.test');
    assert.equal(body.get('_replyto'), 'client@example.test');
    assert.equal(body.get('_url'), 'https://www.jakeardoin.com/');
    assert.equal(body.get('_subject'), contactDelivery.subject);
    assert.equal(body.get('_template'), 'table');
    assert.ok(!body.has('_cc') && !body.has('_webhook') && !body.has('_captcha'));
    return Response.json({ success: 'true', message: 'The form was submitted successfully.' });
  });
  assert.equal(calls, 1);
  assert.equal(contactDelivery.action, 'https://formsubmit.co/5b52001950c0cc4c66cae8abe3c605dd');
});

test('rejects invalid input before sending and retains the original form values', async () => {
  const noDelivery = () => { throw new Error('Must not send'); };
  for (const fields of [{ name: '' }, { email: 'invalid' }, { email: 'test@example.test\r\nBcc: other@example.test' }, { name: 'a'.repeat(101) }, { service: 'Something else' }, { message: ' ' }, { message: 'x'.repeat(5001) }]) {
    const data = form(fields);
    const before = [...data];
    await assert.rejects(submitContact(data, noDelivery));
    assert.deepEqual([...data], before);
  }
});

test('reports no success for rate limits, redirects, false responses, activation, or network errors; never retries', async () => {
  for (const upstream of [
    () => Response.json({ success: 'false' }),
    () => Response.json({ success: true, message: 'Please activate your form' }),
    () => Response.json({ success: 1 }),
    () => new Response(null, { status: 302, headers: { Location: 'https://other.example.test/' } }),
    () => new Response('Rate limited', { status: 429 }),
    () => new Response('Unavailable', { status: 503 }),
    () => new Response('<html>Challenge</html>'),
    () => { throw new TypeError('Failed to fetch'); },
  ]) {
    let calls = 0;
    const data = form();
    await assert.rejects(submitContact(data, async () => { calls++; return upstream(); }));
    assert.equal(calls, 1);
    assert.equal(data.get('message'), inquiry.message);
  }
});

test('keeps the provider-supported honeypot and accepts boolean success responses', async () => {
  await submitContact(form({ _honey: 'spam.example.test' }), async (_url, options) => {
    assert.equal(options.body.get('_honey'), 'spam.example.test');
    return Response.json({ success: true });
  });
});
