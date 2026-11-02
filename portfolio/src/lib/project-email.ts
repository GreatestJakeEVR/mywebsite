interface ProjectInquiry {
  name: string;
  email: string;
  service: string;
  message: string;
}

export function prepareProjectEmail(inquiry: ProjectInquiry) {
  const name = inquiry.name.trim();
  const email = inquiry.email.trim();
  const message = inquiry.message.trim();
  if (!name || !email || !message) return null;

  const recipient = 'jakedevworks@gmail.com';
  const subject = `Project inquiry: ${inquiry.service}`;
  const body = `Hello Jake,\n\n${message}\n\nService: ${inquiry.service}\nName: ${name}\nReply email: ${email}`;
  return {
    draft: `Subject: ${subject}\n\n${body}`,
    href: `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
