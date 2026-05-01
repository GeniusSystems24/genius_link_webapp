/* Theme controller — toggles between light and dark, persists in localStorage. */
(function () {
  const root = document.documentElement;
  const STORAGE_KEY = 'invoice-theme';
  let bound = false;

  const SUN_ICON = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
  const MOON_ICON = '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>';

  function current() { return root.getAttribute('data-theme') || 'light'; }

  function update() {
    const t = current();
    const lang = root.lang || 'en';
    const labelEl = document.getElementById('theme-label');
    const iconEl = document.getElementById('theme-icon');
    if (labelEl) {
      const map = window.AppI18n ? window.AppI18n.commonLabels(lang) : null;
      labelEl.textContent = map ? (t === 'dark' ? map.dark : map.light) : (t === 'dark' ? 'Dark' : 'Light');
    }
    if (iconEl) iconEl.innerHTML = t === 'dark' ? MOON_ICON : SUN_ICON;
  }

  function apply(next, persist) {
    root.setAttribute('data-theme', next);
    if (persist !== false) localStorage.setItem(STORAGE_KEY, next);
    update();
    return next;
  }

  function sync() {
    return apply(localStorage.getItem(STORAGE_KEY) || current() || 'light', false);
  }

  function toggle() {
    return apply(current() === 'dark' ? 'light' : 'dark');
  }

  function handleDocumentClick(event) {
    if (!event.target.closest('#theme-toggle')) return;
    event.preventDefault();
    toggle();
  }

  function init() {
    sync();

    if (bound) return;
    bound = true;
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('genius:language-change', update);
    window.addEventListener('genius:ui-sync', sync);
  }

  window.AppTheme = { init, update, toggle, current, sync };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
