import assert from 'node:assert/strict';
import test from 'node:test';
import { contactDelivery, submitContact } from '../src/lib/contact.ts';

const inquiry = { name: ' Example Client ', email: ' client@example.test ', service: '3D design & printing', message: ' A 30mm part & a bracket? #1 = “prototype” 🛠\nTwo pieces, please. ' };
const form = (overrides = {}) => {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...inquiry, ...overrides })) data.set(key, value);
  return data;
};

test('submits to Web3Forms with the fixed owner key and only intended fields', async () => {
  let calls = 0;
  await submitContact(form({ access_key: 'attacker-key', ccemail: 'attacker@example.test', webhook: 'https://example.test/', redirect: 'https://example.test/', replyto: 'attacker@example.test' }), async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.web3forms.com/submit');
    assert.equal(options.method, 'POST');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.headers['Content-Type'], 'application/json');
    const body = JSON.parse(options.body);
    assert.equal(body.access_key, '0af992cd-70a7-4bef-ac77-45e7a8e07a37');
    assert.equal(body.name, 'Example Client');
    assert.equal(body.message, inquiry.message.trim());
    assert.equal(body.email, 'client@example.test');
    assert.equal(body.replyto, 'client@example.test');
    assert.equal(body.subject, contactDelivery.subject);
    assert.equal(body.from_name, 'Jake DevWorks');
    assert.deepEqual(Object.keys(body).sort(), ['access_key', 'email', 'from_name', 'message', 'name', 'replyto', 'service', 'subject']);
    return Response.json({ success: true, message: 'Email sent successfully!' });
  });
  assert.equal(calls, 1);
  assert.equal(contactDelivery.action, 'https://api.web3forms.com/submit');
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

test('reports no success for provider errors or ambiguous responses and never retries', async () => {
  for (const upstream of [
    () => Response.json({ success: 'false' }),
    () => Response.json({ success: 'true' }),
    () => Response.json({ success: 1 }),
    () => new Response(null, { status: 302, headers: { Location: 'https://other.example.test/' } }),
    () => new Response('Rate limited', { status: 429 }),
    () => new Response('Unavailable', { status: 503 }),
    () => new Response('Origin timed out', { status: 522 }),
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

test('passes a checked spam trap as the provider-supported boolean botcheck', async () => {
  await submitContact(form({ botcheck: 'true' }), async (_url, options) => {
    assert.equal(JSON.parse(options.body).botcheck, true);
    return Response.json({ success: true });
  });
});
