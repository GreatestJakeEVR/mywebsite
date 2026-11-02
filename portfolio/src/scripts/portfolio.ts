import { prepareProjectEmail } from '../lib/project-email';

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
const draftText = required<HTMLTextAreaElement>('#draft-text');
const draftPanel = required<HTMLElement>('#email-draft');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const email = prepareProjectEmail({
    name: String(fields.get('name') ?? ''),
    email: String(fields.get('email') ?? ''),
    service: String(fields.get('service') ?? ''),
    message: String(fields.get('message') ?? ''),
  });
  if (!email) return;
  draftText.value = email.draft;
  draftPanel.hidden = false;
  window.location.href = email.href;
});
const copyStatus = required<HTMLElement>('#copy-status');
required<HTMLButtonElement>('#copy-draft').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(draftText.value);
    copyStatus.textContent = 'Copied.';
  } catch {
    draftText.focus();
    draftText.select();
    copyStatus.textContent = 'Selected—use your device’s Copy command.';
  }
});
