/* Sale type pill — renders a colored badge for the invoice type
 * (cash | installment | credit | advance). */
(function () {
  function html(type, opts) {
    const o = opts || {};
    const lang = o.lang || (window.AppI18n && window.AppI18n.getLang());
    const label = window.AppI18n
      ? window.AppI18n.t('type-' + type, lang)
      : type;
    return `<span class="inv-type ${type}">${label}</span>`;
  }

  window.AppInvTypePill = { html };
})();
