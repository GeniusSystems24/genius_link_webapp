/* Info rows — renders a vertical key/value list. Suitable for sidebar cards
 * and the mobile info panels.
 *
 * Item shape: { keyLabel, keyI18n, value, valueClass, mono } */
(function () {
  function rowHtml(item, mobile) {
    const cls = mobile ? 'm-info-row' : 'q-row';
    const valClasses = ['v'];
    if (item.mono) valClasses.push('mono');
    if (item.valueClass) valClasses.push(item.valueClass);
    const keyAttr = item.keyI18n ? ` data-i18n="${item.keyI18n}"` : '';
    return `<div class="${cls}">
      <span class="k"${keyAttr}>${item.keyLabel || ''}</span>
      <span class="${valClasses.join(' ')}"${item.valueStyle ? ` style="${item.valueStyle}"` : ''}>${item.value}</span>
    </div>`;
  }

  function render(host, items, opts) {
    const o = opts || {};
    host.innerHTML = items.map(item => rowHtml(item, o.mobile)).join('');
  }

  window.AppInfoRows = { render, rowHtml };
})();
