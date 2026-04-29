/* Invoice row component — produces both the desktop table row and the mobile
 * card markup for a single invoice. Status / sale-type rendering is delegated
 * to the status-badge and inv-type-pill components. */
(function () {
  const VIEW_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const MORE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>';

  function detailsUrl(inv) {
    return inv.type === 'cash'
      ? 'Sale Invoice Details - Cash.html'
      : 'Sale Invoice Details.html';
  }

  /** Desktop: full row in the invoice list table. */
  function tableRowHtml(inv) {
    const fmt = window.AppFormat;
    const balance = Math.max(0, inv.total - inv.paid);
    const paidPct = fmt.pct(inv.paid, inv.total);
    return `
      <div class="td"><span class="inv-ref">${inv.ref}</span></div>
      <div class="td"><div class="inv-cust">
        <div class="cust-av" style="background:${inv.color}">${inv.cust[0]}</div>
        <div><div class="cust-nm">${inv.cust}</div><div class="cust-id mono">#${inv.custId}</div></div>
      </div></div>
      <div class="td" style="color:var(--text-muted);font-size:12.5px">${inv.date}</div>
      <div class="td">${window.AppInvTypePill.html(inv.type)}</div>
      <div class="td"><span class="amt">${fmt.money(inv.total)}</span></div>
      <div class="td">
        <span class="amt pos">${fmt.money(inv.paid)}</span>
        <div class="mini-bar"><div class="mini-bar-fill" style="width:${paidPct}%"></div></div>
      </div>
      <div class="td"><span class="amt ${balance>0?'neg':'muted'}">${balance>0?fmt.money(balance):'—'}</span></div>
      <div class="td">${window.AppStatusBadge.html(inv.status)}</div>
      <div class="td"><div class="row-actions">
        <button class="icon-btn" title="View" onclick="event.stopPropagation();window.location.href='${detailsUrl(inv)}'">${VIEW_ICON}</button>
        <button class="icon-btn" title="More" onclick="event.stopPropagation()">${MORE_ICON}</button>
      </div></div>`;
  }

  /** Customer-profile history mini-row (smaller schema). */
  function historyRowHtml(inv) {
    const fmt = window.AppFormat;
    return `
      <div class="td"><span class="inv-ref">${inv.ref}</span></div>
      <div class="td" style="color:var(--text-muted);font-size:12.5px">${inv.date}</div>
      <div class="td">${window.AppInvTypePill.html(inv.type)}</div>
      <div class="td num" style="font-weight:600">${fmt.money(inv.total)}</div>
      <div class="td num" style="color:${inv.balance>0?'var(--danger)':'var(--text-dim)'};font-weight:600">${inv.balance>0?fmt.money(inv.balance):'—'}</div>
      <div class="td">${window.AppStatusBadge.html(inv.status)}</div>`;
  }

  /** Mobile: compact card. */
  function mobileCardHtml(inv) {
    const fmt = window.AppFormat;
    const balance = Math.max(0, inv.total - inv.paid);
    const paidPct = fmt.pct(inv.paid, inv.total);
    return `
      <div class="top">
        <span class="inv-ref">${inv.ref}</span>
        <span style="font-size:11.5px;color:var(--text-dim)">${inv.date}</span>
      </div>
      <div class="mid">
        <div class="cust-av" style="background:${inv.color};width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:#fff;font-size:11px;font-weight:700">${inv.cust[0]}</div>
        <div class="name">${inv.cust}</div>
        <span style="margin-left:auto">${window.AppStatusBadge.html(inv.status)}</span>
      </div>
      <div class="bottom">
        <div class="total">${fmt.money(inv.total)}</div>
        <div class="bar-wrap">
          <div class="bar"><div class="bar-fill" style="width:${paidPct}%"></div></div>
          <div style="font-size:10.5px;color:var(--text-dim);margin-top:3px">${paidPct}% paid</div>
        </div>
        <div style="text-align:right;font-size:12px;color:${balance>0?'var(--danger)':'var(--text-dim)'}">
          <span>${balance>0?'−'+fmt.money(balance):'Settled'}</span>
        </div>
      </div>`;
  }

  /** Customer-profile mobile mini-row. */
  function mobileHistoryRowHtml(inv) {
    const fmt = window.AppFormat;
    return `
      <div><div class="ref">${inv.ref}</div><div class="dt">${inv.date}</div></div>
      <div style="text-align:right">
        <div class="total">${fmt.money(inv.total)}</div>
        ${window.AppStatusBadge.html(inv.status, { small: true })}
      </div>`;
  }

  window.AppInvoiceRow = {
    detailsUrl,
    tableRowHtml,
    historyRowHtml,
    mobileCardHtml,
    mobileHistoryRowHtml,
  };
})();
