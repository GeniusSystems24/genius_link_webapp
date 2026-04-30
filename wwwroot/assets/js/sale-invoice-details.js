/* Sale Invoice Details page logic. The same page renders both the installment
 * and cash variants, selected by query string or the legacy cash filename. */

let invoice = null;
let applyingI18n = false;
let refundFull = true;

const CASH_REFS = new Set(['INV-2023-014']);

const ICONS = {
  void: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/></svg>',
  print: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>',
  edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4l6 6-10 10H4v-6L14 4z"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12l5 5 9-11"/></svg>',
  mail: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  refund: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 009 9 9 9 0 009-9 9 9 0 00-9-9M3 12l3-3m-3 3l3 3"/></svg>',
  export: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  call: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.87 1.18 2 2 0 012.85 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
  file: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
};

function el(id) { return document.getElementById(id); }
function setText(id, value) { const node = el(id); if (node) node.textContent = value ?? ''; }
function setHtml(id, value) { const node = el(id); if (node) node.innerHTML = value ?? ''; }
function setHidden(id, hidden) { const node = el(id); if (node) node.hidden = hidden; }
function tr(key) { return window.AppI18n ? window.AppI18n.t(key) : key; }
function fmt(n) { return AppFormat.money(Number(n) || 0); }
function isCash(inv) { return inv && inv.type === 'cash'; }
function cashTotal(inv) { return inv.totals.displayedTotal ?? inv.totals.invoiceTotal; }
function route(name, fallback) {
  return (window.GeniusRoutes && window.GeniusRoutes[name]) || fallback;
}

function requestedVariant() {
  const params = new URLSearchParams(window.location.search);
  const raw = [
    params.get('type'),
    params.get('variant'),
    params.get('invoice'),
    params.get('ref'),
  ].filter(Boolean).join(' ').toLowerCase();
  if (raw.includes('cash') || CASH_REFS.has(params.get('ref'))) return 'cash';
  if (window.location.pathname.toLowerCase().includes('cash')) return 'cash';
  return 'installment';
}

function statusKey(status) {
  if (status === 'paid') return 'status-paid';
  if (status === 'partial') return 'status-partial';
  if (status === 'voided') return 'status-voided';
  if (status === 'refunded') return 'status-refunded';
  return 'status-' + status;
}

function statusClass(status) {
  if (status === 'paid') return 'paid';
  if (status === 'partial') return 'partial';
  return status || 'partial';
}

function setStatusBadge(id, status) {
  const node = el(id);
  if (!node) return;
  const key = statusKey(status);
  node.className = 'status ' + statusClass(status);
  node.innerHTML = `<span class="dot"></span><span data-i18n="${key}">${tr(key)}</span>`;
}

function typePillNode() {
  let node = el('invoice-type-pill');
  if (!node) {
    node = document.querySelector('.page-head .meta .pill.purple, .page-head .meta .pill.green-solid');
    if (node) node.id = 'invoice-type-pill';
  }
  return node;
}

function setTypePill(inv) {
  const node = typePillNode();
  if (!node) return;
  if (isCash(inv)) {
    node.className = 'pill green-solid';
    node.dataset.i18n = 'pill-cash-sale';
    node.textContent = tr('pill-cash-sale');
    return;
  }
  node.className = 'pill purple';
  node.dataset.i18n = 'pill-installment';
  node.textContent = tr('pill-installment');
}

function updateTopbarCrumb(inv) {
  const crumb = document.querySelector('.crumbs span:last-child');
  if (crumb) crumb.textContent = inv.ref;
}

function actionHtml(action, fullWidth) {
  const tag = action.href ? 'a' : 'button';
  const href = action.href ? ` href="${action.href}"` : '';
  const onclick = action.onclick ? ` onclick="${action.onclick}"` : '';
  const title = action.title ? ` title="${action.title}"` : '';
  const width = fullWidth ? 'width:100%;justify-content:flex-start' : '';
  const style = action.style || width;
  const styleAttr = style ? ` style="${style}"` : '';
  const label = action.key ? tr(action.key) : action.label;
  const i18n = action.key ? ` data-i18n="${action.key}"` : '';
  return `<${tag} class="btn ${action.variant || ''}"${href}${onclick}${title}${styleAttr}>${action.icon || ''}<span${i18n}>${label}</span></${tag}>`;
}

function renderPageActions(inv) {
  const actions = isCash(inv)
    ? [
        { key: 'btn-void', icon: ICONS.void, variant: 'ghost', onclick: "openSheet('sheet-void')" },
        { key: 'btn-print-receipt', icon: ICONS.print, onclick: 'window.print()' },
        { key: 'btn-email-receipt', icon: ICONS.mail, onclick: "openSheet('sheet-email')" },
        { key: 'btn-new-invoice', icon: ICONS.plus, href: route('createSaleInvoice', '/create-sale-invoice') },
        { key: 'btn-refund', icon: ICONS.refund, variant: 'danger', onclick: "openSheet('sheet-refund')" },
      ]
    : [
        { key: 'btn-void', icon: ICONS.void, variant: 'ghost', onclick: "openSheet('sheet-void')", title: 'Void invoice' },
        { key: 'btn-print', icon: ICONS.print, onclick: 'window.print()' },
        { key: 'btn-edit', icon: ICONS.edit, href: route('createSaleInvoice', '/create-sale-invoice') },
        { key: 'btn-record-payment', icon: ICONS.check, variant: 'primary', href: route('recordPayment', '/record-payment') },
      ];
  setHtml('page-actions', actions.map(a => actionHtml(a)).join(''));
}

function renderHeader(inv) {
  document.title = isCash(inv) ? 'Sale Invoice Details - Cash' : 'Sale Invoice Details';
  updateTopbarCrumb(inv);
  setText('inv-ref-pill', inv.ref);
  setText('inv-ref-pill-mobile', inv.ref);
  setText('inv-title', `Sale Invoice - ${inv.customer.name}`);
  setStatusBadge('invoice-status', inv.status);
  setStatusBadge('m-invoice-status', inv.status);
  setTypePill(inv);

  if (isCash(inv)) {
    setHtml('inv-date-meta', `<span>Posted &amp; settled</span> <strong style="color:var(--text)">${inv.date}</strong> &nbsp;-&nbsp; ${inv.time}`);
    const ratio = el('paid-ratio');
    if (ratio) {
      ratio.className = 'pill success';
      ratio.dataset.i18n = 'pill-immediate';
      ratio.textContent = tr('pill-immediate');
    }
  } else {
    const dueRange = inv.installments.length
      ? `${inv.installments[0].due} - ${inv.installments[inv.installments.length - 1].due}`
      : '';
    setHtml('inv-date-meta', `<span data-i18n="lbl-posted">${tr('lbl-posted')}</span> <strong style="color:var(--text)" id="inv-posted">${inv.datePosted}</strong> &nbsp;-&nbsp; <span data-i18n="lbl-due">${tr('lbl-due')}</span> <strong style="color:var(--amber)" id="inv-due-range">${dueRange}</strong>`);
    const counts = installmentCounts(inv);
    const ratio = el('paid-ratio');
    if (ratio) {
      ratio.className = 'pill amber';
      delete ratio.dataset.i18n;
      ratio.textContent = `${counts.paid || 0} / ${inv.installments.length} paid`;
    }
  }

  setText('m-customer-name', inv.customer.name);
  const saleLabel = el('m-sale-label');
  if (saleLabel) {
    saleLabel.dataset.i18n = isCash(inv) ? 'm-cash-invoice' : 'm-sale-invoice';
    saleLabel.textContent = tr(saleLabel.dataset.i18n);
  }
  const mobileEyebrow = document.querySelector('.m-eyebrow');
  if (mobileEyebrow) {
    mobileEyebrow.dataset.i18n = isCash(inv) ? 'm-cash-invoice' : 'm-sale-invoice';
    mobileEyebrow.textContent = tr(mobileEyebrow.dataset.i18n);
  }
  renderPageActions(inv);
}

function renderReceiptBanner(inv) {
  if (!isCash(inv)) {
    setHidden('receipt-banner', true);
    return;
  }
  const amount = cashTotal(inv);
  const host = el('receipt-banner');
  host.hidden = false;
  host.innerHTML = `
    <div class="rb-left">
      <div class="rb-icon">${ICONS.check.replace('width="14" height="14"', 'width="22" height="22"')}</div>
      <div>
        <div class="rb-title" data-i18n="rb-title">${tr('rb-title')}</div>
        <div class="rb-sub">Cash - ${inv.date} ${inv.time} - ${inv.store} - ${inv.register}</div>
      </div>
    </div>
    <div>
      <div class="rb-amount">${fmt(amount)}</div>
      <div class="rb-amt-sub"><span data-i18n="lbl-inv-total">${tr('lbl-inv-total')}</span> - <span data-i18n="sub-settled">${tr('sub-settled')}</span></div>
    </div>`;
}

function renderSummaryStrip(inv) {
  const t = inv.totals;
  const host = el('summary-strip');
  if (isCash(inv)) {
    host.innerHTML = `
      <div class="strip-cell">
        <div class="lbl" data-i18n="lbl-inv-total">${tr('lbl-inv-total')}</div>
        <div class="val primary">${fmt(cashTotal(inv))}</div>
        <div class="sub">Tax inclusive</div>
      </div>
      <div class="strip-cell accent-success">
        <div class="lbl" data-i18n="lbl-tendered">${tr('lbl-tendered')}</div>
        <div class="val success">${fmt(t.tendered)}</div>
        <div class="sub" data-i18n="sub-cash-paid">${tr('sub-cash-paid')}</div>
      </div>
      <div class="strip-cell accent-success">
        <div class="lbl" data-i18n="lbl-change">${tr('lbl-change')}</div>
        <div class="val success">${fmt(t.change)}</div>
        <div class="sub" data-i18n="sub-change">${tr('sub-change')}</div>
      </div>
      <div class="strip-cell">
        <div class="lbl" data-i18n="lbl-balance">${tr('lbl-balance')}</div>
        <div class="val success">${fmt(t.balance)}</div>
        <div class="sub" data-i18n="sub-settled">${tr('sub-settled')}</div>
      </div>`;
    return;
  }

  const nextDue = inv.installments.find(i => i.status === 'due' || i.status === 'overdue');
  host.innerHTML = `
    <div class="strip-cell">
      <div class="lbl" data-i18n="lbl-inv-total">${tr('lbl-inv-total')}</div>
      <div class="val primary">${fmt(t.invoiceTotal)}</div>
      <div class="sub" data-i18n="sub-inv-total">${tr('sub-inv-total')}</div>
    </div>
    <div class="strip-cell">
      <div class="lbl" data-i18n="lbl-paid-so-far">${tr('lbl-paid-so-far')}</div>
      <div class="val success">${fmt(t.paidSoFar)}</div>
      <div class="sub" data-i18n="sub-paid-so-far">${tr('sub-paid-so-far')}</div>
    </div>
    <div class="strip-cell">
      <div class="lbl" data-i18n="lbl-balance-remaining">${tr('lbl-balance-remaining')}</div>
      <div class="val danger">${fmt(t.balance)}</div>
      <div class="sub" data-i18n="sub-balance">${tr('sub-balance')}</div>
    </div>
    <div class="strip-cell accent">
      <div class="lbl" data-i18n="lbl-per-inst">${tr('lbl-per-inst')}</div>
      <div class="val primary">${fmt(t.perInstallment)}</div>
      <div class="sub"><span data-i18n="sub-per-inst">${tr('sub-per-inst')}</span> ${nextDue ? nextDue.due : ''}</div>
    </div>`;
}

function renderProgress(inv) {
  setHidden('payment-progress-card', isCash(inv));
  if (isCash(inv)) return;
  const pct = inv.progressPct;
  const fill = el('pay-fill');
  if (fill) fill.style.width = pct + '%';
  setText('pay-pct', pct + '% paid');
  setText('pay-collected', fmt(inv.totals.paidSoFar));
  setText('pay-total', fmt(inv.totals.invoiceTotal));
  const mFill = el('m-pay-fill');
  if (mFill) mFill.style.width = pct + '%';
  setText('m-pay-pct', pct + '% paid');
}

function renderInfoGrid(host, items) {
  host.innerHTML = items.map(item => `
    <div class="info-item">
      <div class="k"${item.keyI18n ? ` data-i18n="${item.keyI18n}"` : ''}>${item.keyI18n ? tr(item.keyI18n) : item.keyLabel}</div>
      <div class="v ${item.mono ? 'mono' : ''} ${item.valueClass || ''}">${item.value}</div>
    </div>`).join('');
}

function renderInvoiceDetails(inv) {
  const items = isCash(inv)
    ? [
        { keyI18n: 'k-reference', value: inv.ref, mono: true },
        { keyI18n: 'k-store', value: inv.store },
        { keyI18n: 'k-datetime', value: `${inv.date} - ${inv.time}` },
        { keyI18n: 'k-sale-type', value: AppInvTypePill.html(inv.type) },
        { keyI18n: 'k-currency', value: inv.currency },
        { keyI18n: 'k-tax-scheme', value: inv.taxScheme },
        { keyI18n: 'k-cash-acct', value: `${inv.cashAccountCode} - ${inv.cashAccountName}`, mono: true, valueClass: 'muted' },
        { keyI18n: 'k-served-by', value: `${inv.servedBy} - ${inv.register}` },
      ]
    : [
        { keyI18n: 'k-reference', value: inv.ref, mono: true },
        { keyI18n: 'k-store', value: inv.store },
        { keyI18n: 'k-date-posted', value: inv.datePosted },
        { keyI18n: 'k-sale-type', value: AppInvTypePill.html(inv.type) },
        { keyI18n: 'k-currency', value: inv.currency },
        { keyI18n: 'k-tax-scheme', value: inv.taxScheme },
        { keyI18n: 'k-ar-account', value: inv.arAccountCode, mono: true, valueClass: 'muted' },
        { keyI18n: 'k-created-by', value: inv.createdBy },
      ];
  renderInfoGrid(el('inv-details-grid'), items);
}

function renderCustomerCard(inv) {
  const c = inv.customer;
  setText('cust-initial', c.initial);
  setText('cust-name', c.name);
  setText('cust-sub', c.since ? `Customer #${c.id} - ${c.label} since ${c.since}` : `Customer #${c.id} - ${c.label}`);
  setText('cust-email', c.email);
  setText('cust-phone', c.phone);
}

function renderAdditionalCosts(inv) {
  const host = el('costs-rows');
  const rows = (inv.additionalCosts || []).map(c => {
    const isCharge = c.type === 'charge';
    const tag = isCharge
      ? '<span class="pill success">+ CHG</span>'
      : '<span class="pill danger">- DIS</span>';
    const valColor = c.amount < 0 ? 'color:var(--danger)' : '';
    const sign = c.amount < 0 ? '-' : '+';
    return `<div class="ctrow">
      <div class="cl">${tag}${c.label}</div>
      <div class="cr num" style="${valColor}">${sign}${fmt(Math.abs(c.amount))}</div>
    </div>`;
  }).join('');
  const netLabel = isCash(inv) ? 'Net after discounts' : tr('lbl-net-after-costs');
  host.innerHTML = `${rows}
    <div class="ctrow" style="background:var(--surface-2)">
      <div class="cl" style="color:var(--text-muted);font-size:12px"${isCash(inv) ? '' : ' data-i18n="lbl-net-after-costs"'}>${netLabel}</div>
      <div class="cr num">${fmt(inv.totals.taxableNet)}</div>
    </div>`;
}

function renderProductSubtotal(inv) {
  setText('prod-subtotal', fmt(inv.totals.subtotal));
  setText('prod-count', inv.products.length);
  setText('m-prod-count', inv.products.length);
}

function totalRow(key, value, cls) {
  return `<div class="trow-total"><span class="k"${key ? ` data-i18n="${key}"` : ''}>${key ? tr(key) : ''}</span><span class="v ${cls || ''}">${value}</span></div>`;
}

function renderTotalsSidebar(inv) {
  const t = inv.totals;
  const host = el('totals-stack');
  if (isCash(inv)) {
    const lineDiscount = t.lineDiscount ? totalRow('lbl-line-disc', fmt(t.lineDiscount), 'neg') : '';
    const loyalty = t.loyaltyDiscount ? totalRow('lbl-loyalty-disc', fmt(t.loyaltyDiscount), 'neg') : '';
    host.innerHTML = `
      ${totalRow('lbl-prod-subtotal', fmt(t.subtotal))}
      ${lineDiscount}
      ${loyalty}
      ${totalRow('lbl-taxable-net', fmt(t.taxableNet))}
      ${totalRow('lbl-tax-excl', '+' + fmt(t.tax), 'pos')}
      <div class="trow-divider"></div>
      ${totalRow('lbl-inv-total-2', fmt(t.invoiceTotal))}
      <div class="trow-divider"></div>
      <div class="grand-row"><span class="k" data-i18n="lbl-balance">${tr('lbl-balance')}</span><span class="v">${fmt(t.balance)}</span></div>`;
    return;
  }

  const lineTotal = t.subtotal + t.shipping + t.discount + t.tax;
  host.innerHTML = `
    ${totalRow('lbl-prod-subtotal', fmt(t.subtotal))}
    ${totalRow('lbl-shipping', '+' + fmt(t.shipping), 'pos')}
    ${totalRow('lbl-holiday-disc', fmt(t.discount), 'neg')}
    ${totalRow('lbl-taxable-net', fmt(t.taxableNet))}
    ${totalRow('lbl-tax-excl', '+' + fmt(t.tax), 'pos')}
    <div class="trow-divider"></div>
    ${totalRow('lbl-inv-total-2', fmt(lineTotal))}
    ${totalRow('lbl-dp', '-' + fmt(t.downPayment), 'neg')}
    <div class="trow-divider"></div>
    <div class="grand-row"><span class="k" data-i18n="lbl-balance-to-finance">${tr('lbl-balance-to-finance')}</span><span class="v">${fmt(t.balanceToFinance)}</span></div>`;
}

function paymentSummaryRows(inv) {
  const rows = [
    { keyI18n: 'lbl-dp', value: fmt(inv.totals.downPayment), valueStyle: 'color:var(--success)' },
  ];
  inv.installments.forEach(it => {
    let suffix = '';
    let color = 'var(--text-dim)';
    if (it.status === 'paid') color = 'var(--success)';
    else if (it.status === 'due' || it.status === 'overdue') { suffix = ' due'; color = 'var(--amber)'; }
    else { suffix = ' sched.'; color = 'var(--text-dim)'; }
    rows.push({ keyLabel: `Installment #${it.no}`, value: `${fmt(it.amount)}${suffix}`, valueStyle: 'color:' + color });
  });
  return rows;
}

function renderPaymentSummary(inv) {
  const title = el('payment-summary-title');
  const mobileTitle = el('m-pay-summary-title');
  if (isCash(inv)) {
    title.dataset.i18n = 'sidebar-cash-summary';
    title.textContent = tr('sidebar-cash-summary');
    mobileTitle.dataset.i18n = 'sidebar-cash-summary';
    mobileTitle.textContent = tr('sidebar-cash-summary');
    AppInfoRows.render(el('pay-summary-rows'), [
      { keyI18n: 'lbl-sale-amount', value: fmt(cashTotal(inv)) },
      { keyI18n: 'lbl-tendered', value: fmt(inv.totals.tendered), valueStyle: 'color:var(--success)' },
      { keyI18n: 'lbl-change', value: '-' + fmt(inv.totals.change), valueStyle: 'color:var(--danger)' },
      { keyI18n: 'lbl-net-cash', value: fmt(cashTotal(inv)), valueStyle: 'color:var(--success);font-size:16px' },
      { keyI18n: 'lbl-receipt-no', value: inv.receiptNo, mono: true },
    ]);
    setHidden('payment-summary-footer', true);
    setHidden('payment-summary-action', true);
    renderMobileCashSummary(inv);
    return;
  }

  title.dataset.i18n = 'sidebar-pay-summary';
  title.textContent = tr('sidebar-pay-summary');
  mobileTitle.dataset.i18n = 'sidebar-pay-summary';
  mobileTitle.textContent = tr('sidebar-pay-summary');
  AppInfoRows.render(el('pay-summary-rows'), paymentSummaryRows(inv));
  setText('total-collected', fmt(inv.totals.totalCollected));
  setText('remaining', fmt(inv.totals.remaining));
  setHidden('payment-summary-footer', false);
  setHidden('payment-summary-action', false);
}

function installmentCounts(inv) {
  return inv.installments.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
}

function renderInstallmentBadges(inv) {
  setHidden('installment-card', isCash(inv));
  setHidden('m-installment-card', isCash(inv));
  if (isCash(inv)) return;
  const counts = installmentCounts(inv);
  setHtml('plan-badges', `
    <span class="pill success">${counts.paid || 0} <span data-i18n="pill-paid">${tr('pill-paid')}</span></span>
    <span class="pill amber">${(counts.due || 0) + (counts.overdue || 0)} <span data-i18n="pill-pending">${tr('pill-pending')}</span></span>
    <span class="pill neutral">${counts.upcoming || 0} <span data-i18n="pill-upcoming">${tr('pill-upcoming')}</span></span>`);
  setHtml('m-plan-badges', `
    <span class="pill success">${counts.paid || 0} ok</span>
    <span class="pill amber">${(counts.due || 0) + (counts.overdue || 0)} due</span>`);
}

function renderCashPaymentRecord(inv) {
  setHidden('cash-payment-card', !isCash(inv));
  setHidden('m-cash-payment-card', !isCash(inv));
  if (!isCash(inv)) return;
  const amount = cashTotal(inv);
  setHtml('cash-payment-card', `
    <div class="card-head">
      <div><div class="card-title" data-i18n="card-pay-record">${tr('card-pay-record')}</div><div class="card-sub" data-i18n="card-pay-record-sub">${tr('card-pay-record-sub')}</div></div>
      <span class="pill success" data-i18n="pill-settled">${tr('pill-settled')}</span>
    </div>
    <div class="card-body" style="padding:8px 0 0">
      <div class="pay-row">
        <div class="pay-dot">${ICONS.check}</div>
        <div class="pay-body">
          <div class="pt" data-i18n="pay-cash-full">${tr('pay-cash-full')}</div>
          <div class="ps">${inv.date} - ${inv.time} - ${inv.cashAccountName} (${inv.cashAccountCode}) - ${inv.register}</div>
          <div class="tags">
            <span class="pill success" data-i18n="pill-settled">${tr('pill-settled')}</span>
            <span class="pill neutral">Receipt #${inv.receiptNo}</span>
            <span class="pill neutral mono">Ref: ${inv.txnRef}</span>
          </div>
        </div>
        <div class="pay-right">
          <div class="amt">${fmt(amount)}</div>
          <div class="change">Tendered ${fmt(inv.totals.tendered)}</div>
        </div>
      </div>
      <div class="change-box">
        <div class="cb-cell"><div class="ck" data-i18n="lbl-tendered">${tr('lbl-tendered')}</div><div class="cv">${fmt(inv.totals.tendered)}</div></div>
        <div class="cb-cell"><div class="ck" data-i18n="lbl-change">${tr('lbl-change')}</div><div class="cv">${fmt(inv.totals.change)}</div></div>
        <div class="cb-cell"><div class="ck" data-i18n="lbl-inv-total">${tr('lbl-inv-total')}</div><div class="cv">${fmt(amount)}</div></div>
        <div class="cb-cell"><div class="ck" data-i18n="lbl-balance-after">${tr('lbl-balance-after')}</div><div class="cv">${fmt(inv.totals.balance)}</div></div>
      </div>
    </div>`);
  setHtml('m-cash-payment-card', `
    <div class="m-card-head"><div class="m-card-title" data-i18n="card-pay-record">${tr('card-pay-record')}</div><span class="pill success" data-i18n="pill-settled">${tr('pill-settled')}</span></div>
    <div class="m-card-body">
      <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--success-soft);border:1px solid color-mix(in oklab,var(--success) 25%,var(--border));border-radius:10px">
        <div style="width:38px;height:38px;border-radius:50%;background:var(--success);display:grid;place-items:center;flex:none;color:#fff">${ICONS.check}</div>
        <div>
          <div style="font-weight:700;font-size:13.5px;color:var(--success-ink)">Cash - ${fmt(amount)} received</div>
          <div style="font-size:11.5px;color:var(--success-ink);opacity:.75;margin-top:2px">${inv.date} ${inv.time} - ${inv.cashAccountName} - Receipt ${inv.receiptNo}</div>
        </div>
      </div>
    </div>`);
}

function renderMobileReceipt(inv) {
  if (!isCash(inv)) {
    setHidden('m-receipt-banner', true);
    setHidden('m-status-summary-card', false);
    return;
  }
  setHidden('m-status-summary-card', true);
  const host = el('m-receipt-banner');
  host.hidden = false;
  host.innerHTML = `
    <div class="mr-status" data-i18n="mr-status">${tr('mr-status')}</div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
      <div>
        <div class="mr-title">${inv.customer.name}</div>
        <div class="mr-ref">${inv.ref} - ${inv.date}</div>
        <div class="mr-amount">${fmt(cashTotal(inv))}</div>
        <div class="mr-sub" data-i18n="mr-sub">${tr('mr-sub')}</div>
      </div>
      <div style="background:rgba(255,255,255,.2);border-radius:14px;width:56px;height:56px;display:grid;place-items:center;flex:none">${ICONS.check.replace('width="14" height="14"', 'width="26" height="26"')}</div>
    </div>
    <div class="m-receipt-grid">
      <div class="mr-stat"><div class="sl" data-i18n="lbl-tendered">${tr('lbl-tendered')}</div><div class="sv">${fmt(inv.totals.tendered)}</div></div>
      <div class="mr-stat"><div class="sl" data-i18n="lbl-change">${tr('lbl-change')}</div><div class="sv">${fmt(inv.totals.change)}</div></div>
      <div class="mr-stat"><div class="sl" data-i18n="lbl-tax-pct">${tr('lbl-tax-pct')}</div><div class="sv">${fmt(inv.totals.tax)}</div></div>
      <div class="mr-stat"><div class="sl" data-i18n="lbl-receipt-no">${tr('lbl-receipt-no')}</div><div class="sv mono" style="font-size:13px">${inv.receiptNo}</div></div>
    </div>`;
}

function renderMobileInfo(inv) {
  const items = isCash(inv)
    ? [
        { keyI18n: 'k-reference', value: inv.ref, mono: true },
        { keyI18n: 'k-datetime', value: `${inv.date} ${inv.time}` },
        { keyI18n: 'k-store', value: inv.store },
        { keyI18n: 'k-sale-type', value: AppInvTypePill.html(inv.type) },
        { keyI18n: 'k-customer', value: `${inv.customer.name} (#${inv.customer.id})` },
        { keyI18n: 'k-served-by', value: `${inv.servedBy} - ${inv.register}` },
      ]
    : [
        { keyI18n: 'k-reference', value: inv.ref, mono: true },
        { keyI18n: 'k-date-posted', value: inv.datePosted },
        { keyI18n: 'k-store', value: inv.store },
        { keyI18n: 'k-sale-type', value: AppInvTypePill.html(inv.type) },
        { keyI18n: 'k-customer', value: `${inv.customer.name} (#${inv.customer.id})` },
        { keyI18n: 'k-currency', value: inv.currency },
        { keyI18n: 'k-tax-scheme', value: inv.taxScheme },
        { keyI18n: 'k-ar-account', value: inv.arAccountCode, mono: true },
        { keyI18n: 'k-created-by', value: inv.createdBy },
        { keyI18n: 'lbl-tax-excl', value: fmt(inv.totals.tax) },
      ];
  AppInfoRows.render(el('m-inv-info'), items, { mobile: true });
}

function renderMobileCustomer(inv) {
  const c = inv.customer;
  const segment = c.since ? `${c.label} since ${c.since}` : c.label;
  AppInfoRows.render(el('m-customer-info'), [
    { keyLabel: 'Name', value: c.name },
    { keyLabel: 'Customer ID', value: '#' + c.id, mono: true },
    { keyLabel: 'Segment', value: segment },
    { keyLabel: 'Email', value: c.email },
  ], { mobile: true });
}

function renderMobileSummary(inv) {
  if (isCash(inv)) return;
  const t = inv.totals;
  setHtml('m-summary-grid', `
    <div class="m-stat primary"><div class="lbl" data-i18n="lbl-inv-total">${tr('lbl-inv-total')}</div><div class="val">${fmt(t.invoiceTotal)}</div></div>
    <div class="m-stat success"><div class="lbl" data-i18n="lbl-paid-so-far">${tr('lbl-paid-so-far')}</div><div class="val">${fmt(t.paidSoFar)}</div></div>
    <div class="m-stat danger"><div class="lbl" data-i18n="lbl-balance-remaining">${tr('lbl-balance-remaining')}</div><div class="val">${fmt(t.balance)}</div></div>
    <div class="m-stat"><div class="lbl" data-i18n="lbl-per-inst">${tr('lbl-per-inst')}</div><div class="val" style="color:var(--primary)">${fmt(t.perInstallment)}</div></div>`);
}

function renderMobileCosts(inv) {
  const rows = (inv.additionalCosts || []).map(c => {
    const tag = c.type === 'charge'
      ? '<span class="pill success">+ CHG</span>'
      : '<span class="pill danger">- DIS</span>';
    const color = c.amount < 0 ? 'var(--danger)' : 'var(--success)';
    const sign = c.amount < 0 ? '-' : '+';
    return `<div class="m-totrow"><span class="k">${tag} ${c.label}</span><span class="v" style="color:${color}">${sign}${fmt(Math.abs(c.amount))}</span></div>`;
  }).join('');
  const netLabel = isCash(inv) ? 'Net after discounts' : tr('lbl-net-after-costs');
  setHtml('m-costs-rows', rows + `
    <div class="m-totrow" style="border:0">
      <span class="k"${isCash(inv) ? '' : ' data-i18n="lbl-net-after-costs"'}>${netLabel}</span>
      <span class="v">${fmt(inv.totals.taxableNet)}</span>
    </div>`);
}

function mobileTotRow(key, value, style) {
  return `<div class="m-totrow"><span class="k"${key ? ` data-i18n="${key}"` : ''}>${key ? tr(key) : ''}</span><span class="v"${style ? ` style="${style}"` : ''}>${value}</span></div>`;
}

function renderMobileTotals(inv) {
  const t = inv.totals;
  if (isCash(inv)) {
    setHtml('m-totals-rows', `
      ${mobileTotRow('lbl-prod-subtotal', fmt(t.subtotal))}
      ${t.lineDiscount ? mobileTotRow('lbl-line-disc', fmt(t.lineDiscount), 'color:var(--danger)') : ''}
      ${t.loyaltyDiscount ? mobileTotRow('lbl-loyalty-disc', fmt(t.loyaltyDiscount), 'color:var(--danger)') : ''}
      ${mobileTotRow('lbl-tax-excl', '+' + fmt(t.tax))}
      <div class="m-grand"><span class="k" data-i18n="lbl-inv-total-2">${tr('lbl-inv-total-2')}</span><span class="v">${fmt(t.invoiceTotal)}</span></div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
        ${mobileTotRow('lbl-tendered', fmt(t.tendered), 'color:var(--success)')}
        ${mobileTotRow('lbl-change', '-' + fmt(t.change), 'color:var(--danger)')}
      </div>
      <div class="m-grand" style="margin-top:10px"><span class="k" data-i18n="lbl-balance">${tr('lbl-balance')}</span><span class="v" style="font-size:22px">${fmt(t.balance)}</span></div>`);
    return;
  }

  const lineTotal = t.subtotal + t.shipping + t.discount + t.tax;
  setHtml('m-totals-rows', `
    ${mobileTotRow('lbl-prod-subtotal', fmt(t.subtotal))}
    ${mobileTotRow('lbl-shipping', '+' + fmt(t.shipping), 'color:var(--success)')}
    ${mobileTotRow('lbl-holiday-disc', fmt(t.discount), 'color:var(--danger)')}
    ${mobileTotRow('lbl-tax-excl', '+' + fmt(t.tax))}
    ${mobileTotRow('lbl-inv-total-2', fmt(lineTotal), 'font-size:16px;color:var(--primary)')}
    ${mobileTotRow('lbl-dp', '-' + fmt(t.downPayment), 'color:var(--danger)')}
    <div class="m-totrow" style="border:0"><span class="k" style="font-weight:700;color:var(--text)" data-i18n="lbl-balance-to-finance">${tr('lbl-balance-to-finance')}</span><span class="v" style="font-size:15px">${fmt(t.balanceToFinance)}</span></div>`);
}

function renderMobilePaymentSummary(inv) {
  if (isCash(inv)) return;
  const rows = paymentSummaryRows(inv).map(item => {
    const keyAttr = item.keyI18n ? ` data-i18n="${item.keyI18n}"` : '';
    const label = item.keyI18n ? tr(item.keyI18n) : item.keyLabel;
    const valStyle = item.valueStyle ? ` style="${item.valueStyle}"` : '';
    return `<div class="m-totrow"><span class="k"${keyAttr}>${label}</span><span class="v"${valStyle}>${item.value}</span></div>`;
  }).join('');
  setHtml('m-pay-summary', rows + `
    <div class="m-totrow"><span class="k" style="font-weight:700;color:var(--text)" data-i18n="lbl-total-collected">${tr('lbl-total-collected')}</span><span class="v" style="color:var(--success)">${fmt(inv.totals.totalCollected)}</span></div>
    <div class="m-totrow" style="border:0"><span class="k" style="font-weight:700;color:var(--text)" data-i18n="lbl-remaining">${tr('lbl-remaining')}</span><span class="v" style="color:var(--danger)">${fmt(inv.totals.remaining)}</span></div>`);
}

function renderMobileCashSummary(inv) {
  setHtml('m-pay-summary', `
    ${mobileTotRow('lbl-sale-amount', fmt(cashTotal(inv)))}
    ${mobileTotRow('lbl-tendered', fmt(inv.totals.tendered), 'color:var(--success)')}
    ${mobileTotRow('lbl-change', '-' + fmt(inv.totals.change), 'color:var(--danger)')}
    ${mobileTotRow('lbl-net-cash', fmt(cashTotal(inv)), 'color:var(--success)')}
    <div class="m-totrow" style="border:0"><span class="k" data-i18n="lbl-receipt-no">${tr('lbl-receipt-no')}</span><span class="v mono">${inv.receiptNo}</span></div>`);
}

function renderQuickActions(inv) {
  const actions = isCash(inv)
    ? [
        { key: 'btn-email-receipt', icon: ICONS.mail, onclick: "openSheet('sheet-email')" },
        { key: 'btn-print-receipt', icon: ICONS.print, onclick: 'window.print()' },
        { key: 'btn-export-pdf', icon: ICONS.export },
        { key: 'btn-refund', icon: ICONS.refund, variant: 'danger', onclick: "openSheet('sheet-refund')" },
      ]
    : [
        { key: 'btn-send-reminder', icon: ICONS.call },
        { key: 'btn-email-pdf', icon: ICONS.mail },
        { key: 'btn-view-journal', icon: ICONS.file },
        { key: 'btn-export-pdf', icon: ICONS.export },
      ];
  setHtml('quick-actions', actions.map(a => actionHtml(a, true)).join(''));
  setHtml('m-quick-actions', actions.map(a => actionHtml({ ...a, icon: '' }, false)).join(''));
}

function renderMobileFooter(inv) {
  const actions = isCash(inv)
    ? [
        { key: 'btn-refund', icon: ICONS.refund, onclick: "openSheet('sheet-refund')" },
        { key: 'btn-print-receipt', icon: ICONS.print, variant: 'primary', onclick: 'window.print()', style: 'justify-content:center' },
      ]
    : [
        { key: 'btn-void', icon: ICONS.void, onclick: "openSheet('sheet-void')" },
        { key: 'btn-record-payment', icon: ICONS.check, variant: 'primary', onclick: "openSheet('sheet-pay')", style: 'justify-content:center' },
      ];
  setHtml('mobile-footer-actions', actions.map(a => actionHtml(a)).join(''));
}

function renderSheets(inv) {
  setHidden('sheet-pay', isCash(inv));
  setHidden('sheet-refund', !isCash(inv));
  setHidden('sheet-email', !isCash(inv));

  if (isCash(inv)) {
    setText('refund-sheet-sub', `${inv.ref} - ${inv.customer.name} - Paid ${fmt(cashTotal(inv))} cash`);
    setText('rp-total', fmt(cashTotal(inv)));
    const refundInput = el('refund-amt');
    if (refundInput) refundInput.value = cashTotal(inv).toFixed(2);
    setText('email-receipt-to', inv.customer.email);
    const emailTo = el('email-receipt-to');
    if (emailTo) emailTo.value = inv.customer.email;
    const subject = el('email-receipt-subject');
    if (subject) subject.value = `Your receipt from Ledgerly - ${inv.ref}`;
    updateRefundPreview();
    return;
  }

  const sub = document.querySelector('#sheet-pay .sheet-head .sub');
  if (sub) sub.innerHTML = `${inv.ref} - ${inv.customer.name} - <span data-i18n="lbl-balance-remaining">${tr('lbl-balance-remaining')}</span> ${fmt(inv.totals.balance)}`;
  const dueItems = inv.installments.filter(i => i.status !== 'paid');
  const firstDue = dueItems[0];
  const amount = firstDue ? firstDue.amount : inv.totals.balance;
  const payAmount = el('pay-amount');
  if (payAmount) payAmount.value = amount.toFixed(2);
  const allocList = document.querySelector('#sheet-pay .alloc-list');
  if (allocList) {
    allocList.innerHTML = dueItems.map((it, index) => `
      <div class="alloc-item ${it.status === 'due' ? 'due' : ''}">
        <input type="checkbox" ${index === 0 ? 'checked' : ''}/>
        <div class="ai-body"><div class="ai-t">Installment #${it.no}</div><div class="ai-s">Due ${it.due}</div></div>
        <div class="ai-r">${fmt(it.amount)}</div>
      </div>`).join('');
  }
}

function renderInvoice(inv) {
  renderHeader(inv);
  renderReceiptBanner(inv);
  renderSummaryStrip(inv);
  renderProgress(inv);
  renderInvoiceDetails(inv);
  renderCustomerCard(inv);
  renderAdditionalCosts(inv);
  renderProductSubtotal(inv);
  renderTotalsSidebar(inv);
  renderPaymentSummary(inv);
  renderInstallmentBadges(inv);
  renderCashPaymentRecord(inv);
  renderMobileReceipt(inv);

  AppProductsTable.render(el('products-rows'), inv.products);
  AppProductsTable.renderMobile(el('m-products-rows'), inv.products);

  if (!isCash(inv)) {
    AppInstallmentTimeline.render(el('installments'), inv.installments, inv.downPayment);
    AppInstallmentTimeline.renderMobile(el('m-installments'), inv.installments);
  }

  AppJournalEntries.render(el('journal-rows'), inv.journalEntries);
  AppJournalEntries.renderMobile(el('m-journal-rows'), inv.journalEntries);
  const note = isCash(inv)
    ? 'Cash sales debit cash directly; no A/R entry is created.'
    : tr('je-empty-note');
  const noteEl = el('journal-note');
  const mNoteEl = el('m-journal-note');
  if (noteEl) {
    noteEl.textContent = note;
    if (isCash(inv)) noteEl.removeAttribute('data-i18n');
    else noteEl.dataset.i18n = 'je-empty-note';
  }
  if (mNoteEl) {
    mNoteEl.textContent = note;
    if (isCash(inv)) mNoteEl.removeAttribute('data-i18n');
    else mNoteEl.dataset.i18n = 'je-empty-note';
  }

  AppActivityLog.render(el('activity-list'), inv.activity);
  AppActivityLog.render(el('m-activity-list'), inv.activity);

  renderMobileInfo(inv);
  renderMobileCustomer(inv);
  renderMobileSummary(inv);
  renderMobileCosts(inv);
  renderMobileTotals(inv);
  renderMobilePaymentSummary(inv);
  renderQuickActions(inv);
  renderMobileFooter(inv);
  renderSheets(inv);
}

function openSheet(id) {
  const sheet = el(id);
  if (!sheet || sheet.hidden) return;
  el('scrim').classList.add('open');
  sheet.classList.add('open');
}

function closeSheets() {
  el('scrim').classList.remove('open');
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
}

window.openSheet = openSheet;
window.closeSheets = closeSheets;

function updateReceipt() {
  if (!invoice || isCash(invoice)) return;
  const balance = invoice.totals.balance;
  const value = parseFloat(el('pay-amount').value) || 0;
  const paid = Math.min(balance, Math.max(0, value));
  const remain = Math.max(0, balance - paid);
  setText('r-paid', fmt(paid));
  const rEl = el('r-remain');
  if (rEl) {
    rEl.textContent = fmt(remain);
    rEl.style.color = remain === 0 ? 'var(--success)' : 'var(--amber)';
  }
  setText('r-prev', fmt(balance));
}

window.updateReceipt = updateReceipt;

function confirmPayment() {
  alert('Payment recorded successfully!');
  closeSheets();
}

window.confirmPayment = confirmPayment;

function setRefundType(value) {
  refundFull = value === 'full';
  const partialField = el('partial-field');
  if (partialField) partialField.style.display = refundFull ? 'none' : 'flex';
  document.querySelectorAll('#refund-type button').forEach(button => {
    button.classList.toggle('active', button.dataset.v === value);
  });
  const input = el('refund-amt');
  if (input && invoice) input.value = refundFull ? cashTotal(invoice).toFixed(2) : '';
  updateRefundPreview();
}

window.setRefundType = setRefundType;

function updateRefundPreview() {
  if (!invoice || !isCash(invoice)) return;
  const max = cashTotal(invoice);
  const input = el('refund-amt');
  const value = input ? parseFloat(input.value) : max;
  const amount = refundFull ? max : Math.min(max, Math.max(0, value || 0));
  setText('rp-total', fmt(max));
  setText('rp-amt', '-' + fmt(amount));
  setText('rp-cash', fmt(amount) + ' cash');
}

window.updateRefundPreview = updateRefundPreview;

function confirmRefund() {
  alert('Refund processed!');
  closeSheets();
}

window.confirmRefund = confirmRefund;

document.addEventListener('click', e => {
  const target = e.target.closest('.seg button');
  if (!target) return;
  target.parentElement.querySelectorAll('button').forEach(button => button.classList.remove('active'));
  target.classList.add('active');
});

function applyDynamicI18n() {
  if (!window.AppI18n) return;
  applyingI18n = true;
  AppI18n.apply(AppI18n.getLang());
  applyingI18n = false;
  if (window.applyPageArabic) window.applyPageArabic(AppI18n.getLang());
}

AppBootstrap.init({
  i18n: ['demo-i18n-common', 'demo-i18n-invoice-details'],
  afterReady: () => {
    const variant = requestedVariant();
    const dataName = variant === 'cash' ? 'demo-invoice-cash' : 'demo-invoice-installment';
    AppDataLoader.load(dataName).then(data => {
      if (!data) return;
      invoice = data;
      renderInvoice(data);
      updateReceipt();
      applyDynamicI18n();
    });
  },
});

AppI18n.onChange(() => {
  if (!invoice || applyingI18n) return;
  renderInvoice(invoice);
  updateReceipt();
  if (window.applyPageArabic) window.applyPageArabic(AppI18n.getLang());
});
