/* View toggle — switches the body between desktop / mobile preview frames. */
(function () {
  const STORAGE_KEY = 'invoice-view';
  let bound = false;

  function current() { return document.body.getAttribute('data-view') || 'desktop'; }

  function apply(view, persist) {
    const next = view === 'mobile' ? 'mobile' : 'desktop';
    document.body.setAttribute('data-view', next);
    if (persist !== false) localStorage.setItem(STORAGE_KEY, next);
    document.querySelectorAll('.view-toggle button').forEach(b => {
      b.classList.toggle('active', b.dataset.view === next);
    });
    return next;
  }

  function set(view) {
    return apply(view, true);
  }

  function sync() {
    return apply(localStorage.getItem(STORAGE_KEY) || current() || 'desktop', false);
  }

  function handleDocumentClick(event) {
    const button = event.target.closest('.view-toggle button');
    if (!button) return;
    event.preventDefault();
    set(button.dataset.view);
  }

  function init() {
    sync();

    if (bound) return;
    bound = true;
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('genius:ui-sync', sync);
  }

  window.AppView = { init, set, current, sync };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
