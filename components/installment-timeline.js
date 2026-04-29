/* Installment timeline component — renders the desktop installment list
 * (.tl-item) and the compact mobile rows (.m-tl). Each installment object:
 * { no, due, paidAt?, lateDays?, account?, amount, status, note? }. */
(function () {
  const CHECK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5 9-11"/></svg>';

  function dotContent(inst) {
    if (inst.status === 'paid') return CHECK;
    return inst.no;
  }

  function statusPill(inst) {
    const map = {
      paid:     '<span class="pill success" data-i18n="pill-paid">Paid</span>',
      due:      '<span class="pill amber" data-i18n="pill-pending">Pending</span>',
      overdue:  '<span class="pill danger" data-i18n="pill-overdue">Overdue</span>',
      upcoming: '<span class="pill neutral" data-i18n="pill-upcoming">Upcoming</span>',
    };
    return map[inst.status] || map.upcoming;
  }

  function descLine(inst) {
    if (inst.status === 'paid' && inst.paidAt) {
      const lateText = inst.lateDays ? ` · ${inst.lateDays} days late` : '';
      return `Paid ${inst.paidAt}${lateText}`;
    }
    return inst.note || 'Scheduled';
  }

  function dateSubColor(inst) {
    if (inst.status === 'due')      return 'color:var(--amber)';
    if (inst.status === 'overdue')  return 'color:var(--danger)';
    if (inst.status === 'upcoming') return 'color:var(--text-dim)';
    return '';
  }

  function amountColor(inst) {
    if (inst.status === 'paid')     return 'color:var(--success)';
    if (inst.status === 'due')      return 'color:var(--amber)';
    if (inst.status === 'overdue')  return 'color:var(--danger)';
    return 'color:var(--text-muted)';
  }

  function downPaymentRow(dp) {
    return `
      <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)">
        <div style="width:40px;display:flex;flex-direction:column;align-items:center">
          <div class="tl-dot paid" style="width:32px;height:32px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5 9-11"/></svg>
          </div>
        </div>
        <div style="flex:1">
          <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);font-weight:600;margin-bottom:3px" data-i18n="lbl-dp">Down Payment</div>
          <div style="font-weight:600;font-size:13.5px">${dp.date}</div>
          <div style="color:var(--text-muted);font-size:12px;margin-top:2px">Received via ${dp.account}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;font-size:15px;color:var(--success);font-variant-numeric:tabular-nums">$${dp.amount.toFixed(2)}</div>
          <span class="pill success" style="margin-top:4px" data-i18n="pill-received">Received</span>
        </div>
      </div>`;
  }

  function itemHtml(inst, isLast) {
    const lineHtml = isLast ? '' : '<div class="tl-line"></div>';
    const accountTag = inst.account
      ? `<div style="margin-top:6px"><span class="pill neutral" style="font-size:11px">${inst.account}</span></div>`
      : '';
    const actionHtml = inst.status === 'due' || inst.status === 'overdue'
      ? `<div class="tl-actions"><button class="btn small primary" onclick="openSheet('sheet-pay')" style="font-size:12px;padding:5px 10px" data-i18n="btn-pay-now">Pay Now</button></div>`
      : (inst.status === 'paid'
          ? `<div class="tl-actions"><button class="icon-btn" title="View receipt"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h5"/></svg></button></div>`
          : '');
    return `<div class="tl-item">
      <div class="tl-dot-col">
        <div class="tl-dot ${inst.status}">${dotContent(inst)}</div>
        ${lineHtml}
      </div>
      <div class="tl-body">
        <div class="inst-no">Installment #${inst.no}</div>
        <div class="date-label">${inst.due}</div>
        <div class="date-sub" style="${dateSubColor(inst)}">${descLine(inst)}</div>
        ${accountTag}
      </div>
      <div class="tl-right">
        <div class="tl-amount" style="${amountColor(inst)}">$${inst.amount.toFixed(2)}</div>
        ${statusPill(inst)}
        ${actionHtml}
      </div>
    </div>`;
  }

  function mobileItemHtml(inst) {
    return `<div class="m-tl">
      <div class="m-tl-dot ${inst.status}">${inst.status === 'paid' ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5 9-11"/></svg>' : inst.no}</div>
      <div class="m-tl-body">
        <div class="mn">Installment #${inst.no}</div>
        <div class="ms">${inst.due}${inst.note ? ' · ' + inst.note : ''}</div>
      </div>
      <div class="m-tl-right">
        <div class="amt" style="${amountColor(inst)}">$${inst.amount.toFixed(2)}</div>
        <div class="s">${inst.status}</div>
      </div>
    </div>`;
  }

  function render(host, installments, downPayment) {
    const dpHtml = downPayment ? downPaymentRow(downPayment) : '';
    const items = installments.map((inst, i) => itemHtml(inst, i === installments.length - 1)).join('');
    host.innerHTML = `${dpHtml}<div class="timeline" style="padding-top:8px">${items}</div>`;
  }

  function renderMobile(host, installments) {
    host.innerHTML = installments.map(mobileItemHtml).join('');
  }

  window.AppInstallmentTimeline = { render, renderMobile, itemHtml, mobileItemHtml };
})();
