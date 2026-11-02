export {};

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing portfolio element: ${selector}`);
  return element;
}

const serviceSelect = required<HTMLSelectElement>('#service');
document.querySelectorAll<HTMLAnchorElement>('[data-service]').forEach(link => {
  link.addEventListener('click', () => {
    if (link.dataset.service) serviceSelect.value = link.dataset.service;
  });
});
const form = required<HTMLFormElement>('#contact-form');
const contactStatus = required<HTMLElement>('#contact-status');
const button = required<HTMLButtonElement>('#contact-form button[type="submit"]');
const label = required<HTMLElement>('.submit-label');
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (button.disabled || !form.reportValidity()) return;
  const fields = new FormData(form);
  const controls = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement>('input, select, textarea, button'));
  controls.forEach(control => { control.disabled = true; });
  form.setAttribute('aria-busy', 'true');
  contactStatus.textContent = 'Sending your message…';
  contactStatus.dataset.state = 'pending';
  label.textContent = 'Sending…';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.fromEntries(fields)),
      signal: AbortSignal.timeout(25000),
    });
    const result: unknown = await response.json();
    if (!response.ok || !result || typeof result !== 'object' || !('ok' in result) || result.ok !== true) throw new Error('Message not sent');
    form.reset();
    contactStatus.textContent = 'Thanks! Your message has been sent. I’ll reply to the email address you provided.';
    contactStatus.dataset.state = 'success';
  } catch {
    contactStatus.textContent = 'Your message could not be sent right now. Your details are still here—please try again shortly, or use the email link.';
    contactStatus.dataset.state = 'error';
  } finally {
    controls.forEach(control => { control.disabled = false; });
    form.setAttribute('aria-busy', 'false');
    label.textContent = 'Send message';
  }
});
