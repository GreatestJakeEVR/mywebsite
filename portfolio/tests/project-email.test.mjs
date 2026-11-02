import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareProjectEmail } from '../src/lib/project-email.ts';

const inquiry = {
  name: '  Example Client  ',
  email: '  example@example.test  ',
  service: '3D design & printing',
  message: '  A 30mm part & a bracket? #1 = “prototype” 🛠\nTwo pieces, please.  ',
};

test('keeps Unicode, punctuation, and line breaks in the email body without creating extra parameters', () => {
  const result = prepareProjectEmail(inquiry);
  const url = new URL(result.href);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'jakedevworks@gmail.com');
  assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
  assert.equal(url.searchParams.get('subject'), 'Project inquiry: 3D design & printing');
  const body = url.searchParams.get('body');
  assert.ok(body.includes(inquiry.message.trim()));
  assert.ok(body.endsWith('Name: Example Client\nReply email: example@example.test'));
  assert.equal(result.draft, `Subject: ${url.searchParams.get('subject')}\n\n${body}`);
});

test('rejects blank required fields before creating a mailto link', () => {
  for (const field of ['name', 'email', 'message']) {
    assert.equal(prepareProjectEmail({ ...inquiry, [field]: ' \n\t ' }), null);
  }
});
