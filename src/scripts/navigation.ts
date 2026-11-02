const menuButton = document.querySelector<HTMLButtonElement>('.menu-toggle');
const navigation = document.querySelector<HTMLElement>('#main-nav');

if (menuButton && navigation) {
  const button = menuButton;
  const nav = navigation;
  function setMenu(open: boolean) {
    button.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }
  button.addEventListener('click', () => {
    setMenu(button.getAttribute('aria-expanded') !== 'true');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      button.focus();
    }
  });
}

export {};
