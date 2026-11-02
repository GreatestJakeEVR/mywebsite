import type { ProjectDetail } from '../data/projects';

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing portfolio element: ${selector}`);
  return element;
}

const projects = JSON.parse(required<HTMLScriptElement>('#project-data').textContent || '{}') as Record<string, ProjectDetail>;

const dialog = required<HTMLDialogElement>('#project-dialog');
const dialogTitle = required<HTMLElement>('#dialog-title');
const dialogCategory = required<HTMLElement>('#dialog-category');
const dialogBody = required<HTMLElement>('#dialog-body');
const external = required<HTMLAnchorElement>('#dialog-external');
let projectTrigger: HTMLButtonElement | null = null;

document.querySelectorAll<HTMLButtonElement>('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.project;
    const project = key && Object.hasOwn(projects, key) ? projects[key] : undefined;
    if (!project) return;
    projectTrigger = button;
    dialogTitle.textContent = project.title;
    dialogCategory.textContent = project.category;
    dialogBody.replaceChildren();
    project.paragraphs.forEach(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      dialogBody.append(paragraph);
    });
    const heading = document.createElement('h3');
    heading.textContent = 'What the work involved';
    const list = document.createElement('ul');
    project.skills.forEach(text => {
      const item = document.createElement('li');
      item.textContent = text;
      list.append(item);
    });
    dialogBody.append(heading, list);
    if (project.note) {
      const note = document.createElement('p');
      note.className = 'detail-label';
      note.textContent = project.note;
      dialogBody.append(note);
    }
    external.hidden = !project.url;
    if (project.url) external.href = project.url;
    else external.removeAttribute('href');
    document.body.classList.add('dialog-open');
    dialog.showModal();
  });
});
function closeProject() { dialog.close(); }
required<HTMLButtonElement>('.dialog-close').addEventListener('click', closeProject);
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  projectTrigger?.focus({ preventScroll: true });
});
required<HTMLAnchorElement>('#dialog-contact').addEventListener('click', closeProject);

const filterStatus = required<HTMLElement>('#filter-status');
const filters = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
const projectCards = document.querySelectorAll<HTMLElement>('[data-category]');
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  projectCards.forEach(project => {
    const visible = filter === 'all' || project.dataset.category === filter;
    project.hidden = !visible;
    if (visible) count += 1;
  });
  filterStatus.textContent = `${count} project${count === 1 ? '' : 's'} shown.`;
}));
