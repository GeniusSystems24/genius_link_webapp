/* Journal entries table component — produces the desktop <tbody> rows and the
 * compact mobile cards. Each entry: { account, code, desc, dr|cr, highlight }. */
(function () {
  function fmtAmt(n) { return n == null ? '—' : '$' + n.toFixed(2); }

  function rowHtml(entry) {
    const cls = entry.highlight ? ' class="highlight"' : '';
    return `<tr${cls}>
      <td><div class="acc">${entry.account}</div><div class="acc-code mono">${entry.code}</div></td>
      <td>${entry.desc}</td>
      <td class="${entry.dr != null ? 'dr' : 'empty'}">${fmtAmt(entry.dr)}</td>
      <td class="${entry.cr != null ? 'cr' : 'empty'}">${fmtAmt(entry.cr)}</td>
    </tr>`;
  }

  function mobileCardHtml(entry) {
    const kind = entry.dr != null ? 'DR' : 'CR';
    const cls  = entry.dr != null ? 'dr' : 'cr';
    const amount = entry.dr != null ? entry.dr : entry.cr;
    return `<div class="m-je-row">
      <div class="m-je-top">
        <div>
          <div class="m-je-kind">${kind}</div>
          <div class="m-je-acc">${entry.account}</div>
          <div class="m-je-code mono">${entry.code}</div>
        </div>
        <div class="m-je-amt ${cls}">${fmtAmt(amount)}</div>
      </div>
      <div class="m-je-desc">${entry.desc}</div>
    </div>`;
  }

  function render(host, entries) {
    host.innerHTML = entries.map(rowHtml).join('');
  }

  function renderMobile(host, entries) {
    host.innerHTML = entries.map(mobileCardHtml).join('');
  }

  window.AppJournalEntries = { render, renderMobile, rowHtml, mobileCardHtml };
})();
