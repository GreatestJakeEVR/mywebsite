const services = ['Software & apps', 'Websites & online presence', '3D design & printing', 'A bit of everything / not sure yet'];
const sentMessage = 'Thanks! Your message has been sent. I’ll reply to the email address you provided.';
const unavailableMessage = 'Your message could not be sent right now. Please try again shortly, or use the email link.';
const canonical = 'https://www.jakeardoin.com/';

class PayloadTooLarge extends Error {}

async function limitedText(source: Request | Response, limit: number): Promise<string> {
  const reader = source.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new PayloadTooLarge();
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

function reply(request: Request, status: number, message: string): Response {
  const ok = status === 200;
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' };
  if (request.headers.get('Accept')?.includes('application/json')) {
    return Response.json({ ok, message }, { status, headers });
  }
  // Only constant application messages enter this page; no form/provider text is echoed.
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Contact · Jake DevWorks</title><main><h1>${ok ? 'Message sent' : 'Message not sent'}</h1><p>${message}</p><a href="/#contact">Return to Jake DevWorks</a></main></html>`;
  return new Response(html, { status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" } });
}

export async function handleContact(request: Request, fetcher: typeof fetch = fetch): Promise<Response> {
  if (request.method !== 'POST') {
    const response = reply(request, 405, 'Please use the contact form to send a message.');
    response.headers.set('Allow', 'POST');
    return response;
  }
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return reply(request, 403, 'Please submit your message from the contact form on this website.');
  }
  const contentType = request.headers.get('Content-Type')?.split(';')[0].trim();
  if (contentType !== 'application/json' && contentType !== 'application/x-www-form-urlencoded') {
    return reply(request, 415, 'Please use the contact form to send a message.');
  }

  let fields: Record<string, unknown>;
  try {
    const body = await limitedText(request, 64 * 1024);
    const parsed: unknown = contentType === 'application/json' ? JSON.parse(body) : Object.fromEntries(new URLSearchParams(body));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid form');
    fields = parsed as Record<string, unknown>;
  } catch (error) {
    return reply(request, error instanceof PayloadTooLarge ? 413 : 400, 'Please check your message and submit the form again.');
  }
  // Ignore filled spam traps without forwarding their content to the email service.
  if (typeof fields.website === 'string' && fields.website.trim()) return reply(request, 200, sentMessage);
  const name = typeof fields.name === 'string' ? fields.name.trim() : '';
  const email = typeof fields.email === 'string' ? fields.email.trim() : '';
  const service = typeof fields.service === 'string' ? fields.service : '';
  const message = typeof fields.message === 'string' ? fields.message.trim() : '';
  if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name) ||
      !email || email.length > 200 || /[\u0000-\u0020\u007f]/.test(email) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
      !services.includes(service) || !message || message.length > 5000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) {
    return reply(request, 400, 'Please check your name, email address, service, and message, then try again.');
  }

  let failureReason = 'network';
  let providerStatus: number | undefined;
  try {
    const response = await fetcher('https://formsubmit.co/ajax/5b52001950c0cc4c66cae8abe3c605dd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Referer: canonical },
      signal: AbortSignal.timeout(15000),
      redirect: 'manual',
      // Forward only approved fields. Visitors cannot set recipients, CC, webhooks, or redirects.
      body: JSON.stringify({ name, email, service, message, _replyto: email, _subject: `Jake DevWorks inquiry: ${service}`, _template: 'table', _url: canonical }),
    });
    providerStatus = response.status;
    failureReason = 'provider_http';
    if (!response.ok) throw new Error('Provider HTTP error');
    failureReason = 'provider_response';
    const result: unknown = JSON.parse(await limitedText(response, 8192));
    if (result && typeof result === 'object' && 'message' in result && typeof result.message === 'string' && /activat/i.test(result.message)) {
      failureReason = 'activation_required';
      throw new Error('Provider activation required');
    }
    if (!result || typeof result !== 'object' || !('success' in result) ||
        (result.success !== true && result.success !== 'true')) {
      failureReason = 'provider_refused';
      throw new Error('Provider did not accept delivery');
    }
    return reply(request, 200, sentMessage);
  } catch {
    // Never log visitor details or provider response bodies.
    console.warn(JSON.stringify({ event: 'contact_delivery_failed', reason: failureReason, providerStatus }));
    return reply(request, 503, unavailableMessage);
  }
}

export function onRequest(context: { request: Request }): Promise<Response> {
  return handleContact(context.request);
}
