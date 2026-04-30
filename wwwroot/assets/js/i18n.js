/* Internationalization layer — loads translation bundles from demo-i18n*.json,
 * applies them to elements with [data-i18n] / [data-i18n-ph] attributes,
 * and exposes a small API for other scripts. */
(function () {
  const STORAGE_KEY = 'invoice-lang';
  const root = document.documentElement;
  const dictionaries = { en: {}, ar: {} };
  const subscribers = [];
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  /** Merge a translation bundle into the dictionaries (overwrites existing keys). */
  function register(bundle) {
    if (!bundle) return;
    ['en', 'ar'].forEach(lang => {
      if (bundle[lang]) Object.assign(dictionaries[lang], bundle[lang]);
    });
  }

  /** Translate a single key using the active language (falls back to English). */
  function t(key, lang) {
    const l = lang || currentLang;
    return (dictionaries[l] && dictionaries[l][key])
      ?? dictionaries.en[key]
      ?? key;
  }

  function commonLabels(lang) {
    const l = lang || currentLang;
    return {
      desktop: t('view-desktop', l),
      mobile: t('view-mobile', l),
      light: t('theme-light', l),
      dark: t('theme-dark', l),
    };
  }

  /** Apply translations to the DOM and update the lang label. */
  function apply(lang) {
    if (lang) currentLang = lang;
    root.lang = currentLang;
    root.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEY, currentLang);

    const langLabel = document.getElementById('lang-label');
    if (langLabel) langLabel.textContent = currentLang === 'ar' ? 'EN' : 'عربي';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const value = t(key);
      if (value !== undefined && value !== null) el.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      const value = t(key);
      if (value) el.placeholder = value;
    });
    document.querySelectorAll('.view-toggle button').forEach(b => {
      const last = b.childNodes[b.childNodes.length - 1];
      if (b.dataset.view === 'desktop') last.textContent = ' ' + t('view-desktop');
      if (b.dataset.view === 'mobile')  last.textContent = ' ' + t('view-mobile');
    });
    if (window.AppTheme) window.AppTheme.update();
    subscribers.forEach(fn => { try { fn(currentLang); } catch (_) {} });
  }

  function toggle() { apply(currentLang === 'ar' ? 'en' : 'ar'); }

  function onChange(fn) { if (typeof fn === 'function') subscribers.push(fn); }

  function getLang() { return currentLang; }

  function bindLangToggle() {
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  window.AppI18n = { register, apply, t, toggle, onChange, getLang, commonLabels };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindLangToggle);
  } else {
    bindLangToggle();
  }
})();
