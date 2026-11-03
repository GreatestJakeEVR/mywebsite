import { submitContact } from '../lib/contact';

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
    await submitContact(fields);
    form.reset();
    contactStatus.textContent = 'Thanks! Your message has been sent. I’ll reply to the email address you provided.';
    contactStatus.dataset.state = 'success';
  } catch {
    contactStatus.textContent = 'We couldn’t confirm that your message was sent. Your details are still here—please wait a moment before trying again, or use the email link.';
    contactStatus.dataset.state = 'error';
  } finally {
    controls.forEach(control => { control.disabled = false; });
    form.setAttribute('aria-busy', 'false');
    label.textContent = 'Send message';
  }
});
