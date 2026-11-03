const alias = '5b52001950c0cc4c66cae8abe3c605dd';
const services = ['Software & apps', 'Websites & online presence', '3D design & printing', 'A bit of everything / not sure yet'];

export const contactDelivery = {
  action: `https://formsubmit.co/${alias}`,
  ajaxAction: `https://formsubmit.co/ajax/${alias}`,
  subject: 'Jake DevWorks website inquiry',
  url: 'https://www.jakeardoin.com/',
};

export async function submitContact(fields: FormData, fetcher: typeof fetch = fetch): Promise<void> {
  const value = (key: string) => {
    const field = fields.get(key);
    return typeof field === 'string' ? field.trim() : '';
  };
  const name = value('name');
  const email = value('email');
  const service = value('service');
  const message = value('message');
  if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name) ||
      !email || email.length > 200 || /[\u0000-\u0020\u007f]/.test(email) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
      !services.includes(service) || !message || message.length > 5000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) {
    throw new Error('Please check the form fields.');
  }
  // The public recipient alias and approved options are fixed, never read from visitor fields.
  const body = new URLSearchParams({
    name, email, service, message, _replyto: email,
    _subject: contactDelivery.subject, _template: 'table', _url: contactDelivery.url,
    _honey: value('_honey').slice(0, 200),
  });
  const response = await fetcher(contactDelivery.ajaxAction, {
    method: 'POST', headers: { Accept: 'application/json' }, body,
    credentials: 'omit', redirect: 'manual', signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error('The email service did not accept the message.');
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object' || !('success' in result) ||
      (result.success !== true && result.success !== 'true') ||
      ('message' in result && typeof result.message === 'string' && /activat/i.test(result.message))) {
    throw new Error('The email service did not confirm the message.');
  }
}
