/* App bootstrap — coordinates loading of i18n bundles and applies the saved
 * language. Pages call AppBootstrap.init({ i18n: ['demo-i18n-common', ...] })
 * once they've loaded their components and demo data. */
(function () {
  function loadI18nBundles(names) {
    return Promise.all(names.map(n => window.AppDataLoader.load(n)))
      .then(bundles => {
        bundles.forEach(b => { if (b) window.AppI18n.register(b); });
      });
  }

  function init(opts) {
    const o = opts || {};
    const bundles = o.i18n || ['demo-i18n-common'];
    return loadI18nBundles(bundles).then(() => {
      window.AppI18n.apply(window.AppI18n.getLang());
      if (typeof o.afterReady === 'function') o.afterReady();
    });
  }

  window.AppBootstrap = { init, loadI18nBundles };
})();
