window.PrimeControllers = window.PrimeControllers || {};

window.PrimeControllers.store = {
  init() {
    const commerce = window.PrimeServices && window.PrimeServices.commerce;
    if (!commerce) return;
    document.documentElement.dataset.storeReady = 'true';
  }
};
