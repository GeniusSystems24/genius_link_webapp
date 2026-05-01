(function () {
  const storageKey = 'invoice-lang';
  const root = document.documentElement;
  const subscribers = new Set();

  function current() {
    return localStorage.getItem(storageKey) || root.lang || 'en';
  }

  function updateLabels(lang) {
    const langLabel = document.getElementById('lang-label');
    if (langLabel) langLabel.textContent = lang === 'ar' ? 'EN' : 'Arabic';
  }

  function apply(lang) {
    const next = lang === 'ar' ? 'ar' : 'en';
    root.lang = next;
    root.dir = next === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(storageKey, next);
    updateLabels(next);
    window.dispatchEvent(new CustomEvent('genius:language-change', { detail: { lang: next } }));
    subscribers.forEach((fn) => {
      try { fn(next); } catch (_) { }
    });
    return next;
  }

  function toggle() {
    return apply(current() === 'ar' ? 'en' : 'ar');
  }

  function subscribe(fn) {
    if (typeof fn === 'function') subscribers.add(fn);
    return function unsubscribe() { subscribers.delete(fn); };
  }

  function bind() {
    apply(current());
    document.querySelectorAll('#lang-toggle').forEach((button) => {
      if (button.dataset.langBound) return;
      button.dataset.langBound = '1';
      button.addEventListener('click', toggle);
    });
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
