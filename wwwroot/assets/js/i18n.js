(function () {
  const labels = {
    en: { desktop: 'Desktop', mobile: 'Mobile', light: 'Light', dark: 'Dark' },
    ar: { desktop: 'Desktop', mobile: 'Mobile', light: 'Light', dark: 'Dark' }
  };

  function lang() {
    return window.GeniusArabic ? window.GeniusArabic.current() : (document.documentElement.lang || 'en');
  }

  function apply(next) {
    return window.GeniusArabic ? window.GeniusArabic.apply(next) : next;
  }

  function toggle() {
    return window.GeniusArabic ? window.GeniusArabic.toggle() : apply(lang() === 'ar' ? 'en' : 'ar');
  }

  function commonLabels(next) {
    return labels[next || lang()] || labels.en;
  }

  function updateStaticLabels() {
    const map = commonLabels();
    document.querySelectorAll('.view-toggle button').forEach((button) => {
      const label = button.querySelector('span');
      if (!label) return;
      if (button.dataset.view === 'desktop') label.textContent = map.desktop;
      if (button.dataset.view === 'mobile') label.textContent = map.mobile;
    });
    if (window.AppTheme) window.AppTheme.update();
  }

  window.AppI18n = {
    apply,
    toggle,
    getLang: lang,
    commonLabels,
    onChange: function (fn) {
      return window.GeniusArabic ? window.GeniusArabic.subscribe(fn) : null;
    },
    register: function () { },
    t: function (key) { return key; }
  };

  window.addEventListener('genius:language-change', updateStaticLabels);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateStaticLabels);
  } else {
    updateStaticLabels();
  }
})();
