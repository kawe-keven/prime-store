window.PrimeControllers = window.PrimeControllers || {};

window.PrimeControllers.admin = {
  init() {
    const toggle = document.querySelector('#adminToggle');
    const panel = document.querySelector('#adminPanel');
    const close = document.querySelector('#closeAdmin');
    if (!toggle || !panel || !close) return;
    toggle.addEventListener('click', () => panel.classList.add('open'));
    close.addEventListener('click', () => panel.classList.remove('open'));
  }
};
