/* Stats strip — renders 4 stat cells from a config array.
 *
 * Each stat: { tone, labelKey|label, value, subKey|sub }
 * tone may be: '' | 'success' | 'danger' | 'primary' | 'amber' */
(function () {
  function cellHtml(stat) {
    const tone = stat.tone ? ` ${stat.tone}` : '';
    const label = stat.labelKey
      ? `<div class="lbl" data-i18n="${stat.labelKey}">${stat.label || ''}</div>`
      : `<div class="lbl">${stat.label || ''}</div>`;
    const sub = stat.subKey
      ? `<div class="sub" data-i18n="${stat.subKey}">${stat.sub || ''}</div>`
      : (stat.sub ? `<div class="sub">${stat.sub}</div>` : '');
    return `<div class="stat-cell${tone}">${label}<div class="val">${stat.value}</div>${sub}</div>`;
  }

  function render(host, stats) {
    host.classList.add('stats-strip');
    host.innerHTML = stats.map(cellHtml).join('');
  }

  window.AppStatsStrip = { render, cellHtml };
})();
