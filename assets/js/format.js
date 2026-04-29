/* Small formatting helpers used by multiple components. */
(function () {
  function money(n, opts) {
    const o = opts || {};
    if (n === 0 && o.dashOnZero) return '—';
    const sign = n < 0 ? '−' : '';
    return sign + '$' + Math.abs(n).toFixed(2);
  }

  function pct(num, denom) {
    return denom > 0 ? Math.round((num / denom) * 100) : 0;
  }

  /** Translates a status / type code via AppI18n if a translation exists. */
  function label(code, kind) {
    if (!code || !window.AppI18n) return code || '';
    const key = (kind ? kind + '-' : '') + code;
    const value = window.AppI18n.t(key);
    return value === key ? code : value;
  }

  window.AppFormat = { money, pct, label };
})();
