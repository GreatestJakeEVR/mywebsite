const services = ['Software & apps', 'Websites & online presence', '3D design & printing', 'A bit of everything / not sure yet'];

export const contactDelivery = {
  action: 'https://api.web3forms.com/submit',
  // Public form identifier supplied by the owner; not a private API credential.
  accessKey: '0af992cd-70a7-4bef-ac77-45e7a8e07a37',
  subject: 'Jake DevWorks website inquiry',
  fromName: 'Jake DevWorks',
  nativeRedirect: 'https://web3forms.com/success',
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
  // Keep the recipient identifier and options fixed; ignore visitor-supplied delivery settings.
  const body = JSON.stringify({
    access_key: contactDelivery.accessKey, name, email, service, message, replyto: email,
    subject: contactDelivery.subject, from_name: contactDelivery.fromName,
    ...(fields.has('botcheck') ? { botcheck: true } : {}),
  });
  const response = await fetcher(contactDelivery.action, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body,
    credentials: 'omit', redirect: 'manual', signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error('The email service did not accept the message.');
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object' || !('success' in result) ||
      result.success !== true) {
    throw new Error('The email service did not confirm the message.');
  }
}
