const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    menuButton.focus();
  }
});

const projects = {
  lanclos: {
    title: 'Lanclos Electronics', category: 'CLIENT WORK / BUSINESS WEBSITE',
    paragraphs: [
      'I created the Lanclos Electronics business website, working directly with the client to turn their business requirements into a working site.',
      'This project is an example of the business website development offered through Jake DevWorks. Each project starts with understanding the business, its customers, and the information those customers need.'
    ],
    skills: ['Client requirements', 'Business website development'],
    url: 'https://www.lancloselectronics.com'
  },
  nasa: {
    title: 'RFID asset tracking', category: 'NASA INTERNSHIP / STENNIS SPACE CENTER / JAN–MAY 2020',
    paragraphs: [
      'During my internship at NASA’s Stennis Space Center, I led implementation of an RFID system for tracking high-value technology assets in the Hive testbed.',
      'I developed a Java application with a graphical interface to operate the RFID system, transfer data to MySQL, and generate alerts. The project also involved coordinating milestones and documentation across departments and working within NASA’s data safety guidelines.'
    ],
    skills: ['Java & graphical interfaces', 'MySQL', 'Hardware integration', 'Technical documentation']
  },
  relief: {
    title: 'Relief Telemed vaccination platform',
    category: 'RELIEF TELEMED / COVID-19 VACCINATION EVENTS',
    paragraphs: [
      'I worked with Relief Telemed on a registration and documentation platform supporting its COVID-19 vaccination events in Baton Rouge.',
      'I developed the API with Python and Django, backed by PostgreSQL, and worked on the main web application using React, TypeScript, and JavaScript to handle registration and vaccination documentation.',
      'I also managed continuous integration and deployment with CircleCI and hosted the application on Aptible.'
    ],
    skills: ['Python & Django API', 'PostgreSQL', 'React, TypeScript & JavaScript', 'CircleCI CI/CD', 'Aptible hosting']
  },
  clinic: {
    title: 'Helping a clinic get found', category: 'CLIENT WORK / ONLINE PRESENCE',
    paragraphs: [
      'I helped Women’s Medical and Surgical Clinic strengthen its online presence by setting up Yelp and Google Business Profile accounts and optimizing website SEO.',
      'The work focused on establishing business listings and improving the clinic’s visibility in search results.'
    ],
    skills: ['Google Business Profile', 'Yelp business listing', 'Website SEO']
  },
  recipes: {
    title: 'Recipes, preserved digitally', category: 'PERSONAL PROJECT / RECIPE EXTRACTION',
    paragraphs: [
      'One of my personal projects explores extracting recipes from vintage cookbooks and organizing them digitally.',
      'The existing website repository includes a Django cookbook application, recipe data, and templates for browsing recipes and authors. It’s a project that brings my interest in software together with my interest in cooking.'
    ],
    skills: ['Python & Django', 'Data extraction', 'Structured recipe data'],
    url: 'https://github.com/GreatestJakeEVR/mywebsite/tree/master/cookbook'
  }
};

const dialog = document.querySelector('#project-dialog');
let projectTrigger = null;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  if (!project || !dialog) return;
  projectTrigger = button;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-category').textContent = project.category;
  const body = document.querySelector('#dialog-body');
  body.replaceChildren();
  project.paragraphs.forEach(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    body.append(paragraph);
  });
  const heading = document.createElement('h3');
  heading.textContent = 'What the work involved';
  const list = document.createElement('ul');
  project.skills.forEach(text => {
    const item = document.createElement('li');
    item.textContent = text;
    list.append(item);
  });
  body.append(heading, list);
  if (project.note) {
    const note = document.createElement('p');
    note.className = 'detail-label';
    note.textContent = project.note;
    body.append(note);
  }
  const external = document.querySelector('#dialog-external');
  external.hidden = !project.url;
  if (project.url) external.href = project.url;
  else external.removeAttribute('href');
  document.body.classList.add('dialog-open');
  dialog.showModal();
}));
function closeProject() { dialog?.close(); }
document.querySelector('.dialog-close')?.addEventListener('click', closeProject);
dialog?.addEventListener('click', event => { if (event.target === dialog) {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject();
}});
dialog?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  projectTrigger?.focus({preventScroll:true});
});
document.querySelector('#dialog-contact')?.addEventListener('click', closeProject);

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  document.querySelectorAll('[data-category]').forEach(project => {
    const visible = filter === 'all' || project.dataset.category === filter;
    project.hidden = !visible;
    if (visible) count += 1;
  });
  document.querySelector('#filter-status').textContent = `${count} project${count === 1 ? '' : 's'} shown.`;
}));

document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
  const select = document.querySelector('#service');
  if (select) select.value = link.dataset.service;
}));

document.querySelector('#contact-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const name = String(fields.get('name')).trim();
  const email = String(fields.get('email')).trim();
  const service = String(fields.get('service'));
  const message = String(fields.get('message')).trim();
  if (!name || !email || !message) return;
  const subject = `Project inquiry: ${service}`;
  const body = `Hello Jake,\n\n${message}\n\nService: ${service}\nName: ${name}\nReply email: ${email}`;
  document.querySelector('#draft-text').value = `Subject: ${subject}\n\n${body}`;
  document.querySelector('#email-draft').hidden = false;
  window.location.href = `mailto:jakedevworks@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
document.querySelector('#copy-draft')?.addEventListener('click', async () => {
  const text = document.querySelector('#draft-text');
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(text.value);
    status.textContent = 'Copied.';
  } catch {
    text.focus();
    text.select();
    status.textContent = 'Selected—use your device’s Copy command.';
  }
});
