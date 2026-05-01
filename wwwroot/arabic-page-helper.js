(function () {
  const storageKey = 'invoice-lang';
  const root = document.documentElement;
  const subscribers = new Set();
  let clickBound = false;
  let syncBound = false;
  let observerStarted = false;
  let syncQueued = false;

  function current() {
    return localStorage.getItem(storageKey) || root.lang || 'en';
  }

  function updateLabels(lang) {
    const langLabel = document.getElementById('lang-label');
    if (langLabel) langLabel.textContent = lang === 'ar' ? 'EN' : 'Arabic';
  }

  function setLanguage(lang, notify) {
    const next = lang === 'ar' ? 'ar' : 'en';
    const prev = root.lang || 'en';
    root.lang = next;
    root.dir = next === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(storageKey, next);
    updateLabels(next);
    if (notify && prev !== next) {
      window.dispatchEvent(new CustomEvent('genius:language-change', { detail: { lang: next } }));
      subscribers.forEach((fn) => {
        try { fn(next); } catch (_) { }
      });
    }
    return next;
  }

  function apply(lang) {
    return setLanguage(lang, true);
  }

  function sync() {
    return setLanguage(current(), false);
  }

  function toggle() {
    return apply(current() === 'ar' ? 'en' : 'ar');
  }

  function subscribe(fn) {
    if (typeof fn === 'function') subscribers.add(fn);
    return function unsubscribe() { subscribers.delete(fn); };
  }

  function requestUiSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(() => {
      syncQueued = false;
      window.dispatchEvent(new Event('genius:ui-sync'));
    });
  }

  function startObserver() {
    if (observerStarted || !document.body) return;
    observerStarted = true;
    new MutationObserver(requestUiSync).observe(document.body, { childList: true, subtree: true });
  }

  function handleDocumentClick(event) {
    if (!event.target.closest('#lang-toggle')) return;
    event.preventDefault();
    toggle();
  }

  function bind() {
    sync();

    if (!clickBound) {
      clickBound = true;
      document.addEventListener('click', handleDocumentClick);
    }

    if (!syncBound) {
      syncBound = true;
      window.addEventListener('genius:ui-sync', sync);
    }

    startObserver();
    requestUiSync();
  }

  window.GeniusArabic = { apply, toggle, current, subscribe };
  window.GeniusApp = window.GeniusApp || {};
  window.GeniusApp.print = function () { window.print(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
