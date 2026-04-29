/* View toggle — switches the body between desktop / mobile preview frames. */
(function () {
  const STORAGE_KEY = 'invoice-view';

  function current() { return document.body.getAttribute('data-view') || 'desktop'; }

  function set(view) {
    document.body.setAttribute('data-view', view);
    localStorage.setItem(STORAGE_KEY, view);
    document.querySelectorAll('.view-toggle button').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY) || 'desktop';
    set(saved);
    document.querySelectorAll('.view-toggle button').forEach(b => {
      b.addEventListener('click', () => set(b.dataset.view));
    });
  }

  window.AppView = { init, set, current };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
