/* Status badge component — renders a colored pill with a leading dot.
 * Status keys (paid|partial|overdue|draft|voided) drive the visual style and
 * are translated through AppI18n with the "status-" prefix. */
(function () {
  function html(status, opts) {
    const o = opts || {};
    const lang = o.lang || (window.AppI18n && window.AppI18n.getLang());
    const label = o.label || (window.AppI18n
      ? window.AppI18n.t('status-' + status, lang)
      : status);
    const size = o.small ? 'font-size:10.5px' : '';
    return `<span class="status-badge ${status}" style="${size}"><span class="dot"></span>${label}</span>`;
  }

  window.AppStatusBadge = { html };
})();
