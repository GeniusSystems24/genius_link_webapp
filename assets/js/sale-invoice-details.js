/* Sale Invoice Details — page logic. Loads demo-invoice-installment.json
 * and renders products, installment timeline, journal entries and the
 * activity log via shared components. */

let invoice = null;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function fmt(n) { return AppFormat.money(n); }

function renderHeader(inv) {
  setText('inv-ref-pill', inv.ref);
  setText('inv-ref-pill-mobile', inv.ref);
  setText('inv-title', `Sale Invoice — ${inv.customer.name}`);
  setText('inv-posted', inv.datePosted);
  const dueRange = inv.installments.length
    ? `${inv.installments[0].due} – ${inv.installments[inv.installments.length - 1].due}`
    : '';
  setText('inv-due-range', dueRange);
}

function renderSummaryStrip(inv) {
  const t = inv.totals;
  const nextDue = inv.installments.find(i => i.status === 'due' || i.status === 'overdue');
  const stripContainer = document.getElementById('summary-strip');
  stripContainer.innerHTML = `
    <div class="strip-cell">
      <div class="lbl" data-i18n="lbl-inv-total">Invoice Total</div>
      <div class="val primary">${fmt(t.invoiceTotal)}</div>
      <div class="sub" data-i18n="sub-inv-total">After tax · Before DP</div>
    </div>
    <div class="strip-cell">
      <div class="lbl" data-i18n="lbl-paid-so-far">Paid So Far</div>
      <div class="val success">${fmt(t.paidSoFar)}</div>
      <div class="sub" data-i18n="sub-paid-so-far">Down pmt + 1 installment</div>
    </div>
    <div class="strip-cell">
      <div class="lbl" data-i18n="lbl-balance-remaining">Balance Remaining</div>
      <div class="val danger">${fmt(t.balance)}</div>
      <div class="sub" data-i18n="sub-balance">2 installments left</div>
    </div>
    <div class="strip-cell accent">
      <div class="lbl" data-i18n="lbl-per-inst">Per Installment</div>
      <div class="val primary">${fmt(t.perInstallment)}</div>
      <div class="sub"><span data-i18n="sub-per-inst">Next due</span> ${nextDue ? nextDue.due : ''}</div>
    </div>`;
}

function renderProgress(inv) {
  const pct = inv.progressPct;
  const fill = document.getElementById('pay-fill');
  if (fill) fill.style.width = pct + '%';
  setText('pay-pct', pct + '% paid');
  setText('pay-collected', fmt(inv.totals.paidSoFar));
  setText('pay-total', fmt(inv.totals.invoiceTotal));
  // mobile fill
  const mFill = document.getElementById('m-pay-fill');
  if (mFill) mFill.style.width = pct + '%';
  setText('m-pay-pct', pct + '% paid');
}

function renderInvoiceDetails(inv) {
  const items = [
    { keyI18n: 'k-reference',   value: inv.ref, mono: true },
    { keyI18n: 'k-store',       value: inv.store },
    { keyI18n: 'k-date-posted', value: inv.datePosted },
    { keyI18n: 'k-sale-type',   value: AppInvTypePill.html(inv.type) },
    { keyI18n: 'k-currency',    value: inv.currency },
    { keyI18n: 'k-tax-scheme',  value: inv.taxScheme },
    { keyI18n: 'k-ar-account',  value: inv.arAccountCode, mono: true, valueClass: 'muted' },
    { keyI18n: 'k-created-by',  value: inv.createdBy },
  ];
  const host = document.getElementById('inv-details-grid');
  host.innerHTML = items.map(item => `
    <div class="info-item">
      <div class="k" data-i18n="${item.keyI18n}">${item.keyLabel || ''}</div>
      <div class="v ${item.mono ? 'mono' : ''} ${item.valueClass || ''}">${item.value}</div>
    </div>`).join('');
}

function renderCustomerCard(inv) {
  const c = inv.customer;
  setText('cust-initial', c.initial);
  setText('cust-name', c.name);
  setText('cust-sub', `Customer #${c.id} · ${c.label} since ${c.since}`);
  setText('cust-email', c.email);
  setText('cust-phone', c.phone);
}

function renderAdditionalCosts(inv) {
  const host = document.getElementById('costs-rows');
  const rows = inv.additionalCosts.map(c => {
    const isCharge = c.type === 'charge';
    const tag = isCharge
      ? '<span class="pill success">+ CHG</span>'
      : '<span class="pill danger">− DIS</span>';
    const valColor = c.amount < 0 ? 'color:var(--danger)' : '';
    const sign = c.amount < 0 ? '−' : '+';
    return `<div class="ctrow">
        <div class="cl">${tag}${c.label}</div>
        <div class="cr num" style="${valColor}">${sign}${fmt(Math.abs(c.amount))}</div>
      </div>`;
  }).join('');
  const net = inv.totals.taxableNet;
  host.innerHTML = `${rows}
    <div class="ctrow" style="background:var(--surface-2)">
      <div class="cl" style="color:var(--text-muted);font-size:12px" data-i18n="lbl-net-after-costs">Net after costs &amp; discounts</div>
      <div class="cr num">${fmt(net)}</div>
    </div>`;
}

function renderProductSubtotal(inv) {
  setText('prod-subtotal', fmt(inv.totals.subtotal));
}

function renderTotalsSidebar(inv) {
  const t = inv.totals;
  const lineTotal = t.subtotal + t.shipping + t.discount + t.tax;
  const host = document.getElementById('totals-stack');
  host.innerHTML = `
    <div class="trow-total"><span class="k" data-i18n="lbl-prod-subtotal">Product Subtotal</span><span class="v">${fmt(t.subtotal)}</span></div>
    <div class="trow-total"><span class="k" data-i18n="lbl-shipping">Shipping Charge</span><span class="v pos">+${fmt(t.shipping)}</span></div>
    <div class="trow-total"><span class="k" data-i18n="lbl-holiday-disc">Holiday Discount (10%)</span><span class="v neg">${fmt(t.discount)}</span></div>
    <div class="trow-total"><span class="k" data-i18n="lbl-taxable-net">Taxable Net</span><span class="v">${fmt(t.taxableNet)}</span></div>
    <div class="trow-total"><span class="k" data-i18n="lbl-tax-excl">Tax (5% excl.)</span><span class="v pos">+${fmt(t.tax)}</span></div>
    <div class="trow-divider"></div>
    <div class="trow-total"><span class="k" data-i18n="lbl-inv-total-2">Invoice Total</span><span class="v">${fmt(lineTotal)}</span></div>
    <div class="trow-total"><span class="k" data-i18n="lbl-dp">Down Payment</span><span class="v neg">−${fmt(t.downPayment)}</span></div>
    <div class="trow-divider"></div>
    <div class="grand-row"><span class="k" data-i18n="lbl-balance-to-finance">Balance to Finance</span><span class="v">${fmt(t.balanceToFinance)}</span></div>`;
}

function paymentSummaryRows(inv) {
  const rows = [
    { keyI18n: 'lbl-dp', value: fmt(inv.totals.downPayment), valueStyle: 'color:var(--success)' },
  ];
  inv.installments.forEach(it => {
    let suffix = '';
    let color = 'var(--text-dim)';
    if (it.status === 'paid') { color = 'var(--success)'; }
    else if (it.status === 'due' || it.status === 'overdue') { suffix = ' due'; color = 'var(--amber)'; }
    else { suffix = ' sched.'; color = 'var(--text-dim)'; }
    rows.push({
      keyLabel: `Installment #${it.no}`,
      value: `${fmt(it.amount)}${suffix}`,
      valueStyle: 'color:' + color,
    });
  });
  return rows;
}

function renderPaymentSummary(inv) {
  const host = document.getElementById('pay-summary-rows');
  AppInfoRows.render(host, paymentSummaryRows(inv));
  setText('total-collected', fmt(inv.totals.totalCollected));
  setText('remaining', fmt(inv.totals.remaining));
}

function renderInstallmentBadges(inv) {
  const counts = inv.installments.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
  const badges = document.getElementById('plan-badges');
  badges.innerHTML = `
    <span class="pill success">${counts.paid || 0} <span data-i18n="pill-paid">Paid</span></span>
    <span class="pill amber">${(counts.due || 0) + (counts.overdue || 0)} <span data-i18n="pill-pending">Pending</span></span>
    <span class="pill neutral">${counts.upcoming || 0} <span data-i18n="pill-upcoming">Upcoming</span></span>`;
}

function renderHeaderPills(inv) {
  const counts = inv.installments.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
  const paid = counts.paid || 0;
  const total = inv.installments.length;
  setText('paid-ratio', `${paid} / ${total} paid`);
}

function renderMobileInfo(inv) {
  const items = [
    { keyI18n: 'k-reference',   value: inv.ref, mono: true },
    { keyI18n: 'k-date-posted', value: inv.datePosted },
    { keyI18n: 'k-store',       value: inv.store },
    { keyI18n: 'k-sale-type',   value: AppInvTypePill.html(inv.type) },
    { keyI18n: 'k-customer',    value: `${inv.customer.name} (#${inv.customer.id})` },
    { keyI18n: 'k-currency',    value: inv.currency },
    { keyI18n: 'k-tax-scheme',  value: inv.taxScheme },
    { keyI18n: 'k-ar-account',  value: inv.arAccountCode, mono: true },
    { keyI18n: 'k-created-by',  value: inv.createdBy },
    { keyI18n: 'lbl-tax-excl',  value: fmt(inv.totals.tax) },
  ];
  AppInfoRows.render(document.getElementById('m-inv-info'), items, { mobile: true });
}

function renderMobileCustomer(inv) {
  const c = inv.customer;
  const items = [
    { keyLabel: 'Name',        value: c.name },
    { keyLabel: 'Customer ID', value: '#' + c.id, mono: true },
    { keyLabel: 'Segment',     value: `${c.label} since ${c.since}` },
    { keyLabel: 'Email',       value: c.email },
  ];
  AppInfoRows.render(document.getElementById('m-customer-info'), items, { mobile: true });
}

function renderMobileSummary(inv) {
  const grid = document.getElementById('m-summary-grid');
  const t = inv.totals;
  grid.innerHTML = `
    <div class="m-stat primary"><div class="lbl" data-i18n="lbl-inv-total">Invoice Total</div><div class="val">${fmt(t.invoiceTotal)}</div></div>
    <div class="m-stat success"><div class="lbl" data-i18n="lbl-paid-so-far">Paid</div><div class="val">${fmt(t.paidSoFar)}</div></div>
    <div class="m-stat danger"><div class="lbl" data-i18n="lbl-balance-remaining">Remaining</div><div class="val">${fmt(t.balance)}</div></div>
    <div class="m-stat"><div class="lbl" data-i18n="lbl-per-inst">Per Install.</div><div class="val" style="color:var(--primary)">${fmt(t.perInstallment)}</div></div>`;
}

function renderMobileCosts(inv) {
  const host = document.getElementById('m-costs-rows');
  const rows = inv.additionalCosts.map(c => {
    const tag = c.type === 'charge'
      ? '<span class="pill success">+ CHG</span>'
      : '<span class="pill danger">− DIS</span>';
    const color = c.amount < 0 ? 'var(--danger)' : 'var(--success)';
    const sign = c.amount < 0 ? '−' : '+';
    return `<div class="m-totrow"><span class="k">${tag} ${c.label}</span><span class="v" style="color:${color}">${sign}${fmt(Math.abs(c.amount))}</span></div>`;
  }).join('');
  host.innerHTML = rows + `
    <div class="m-totrow" style="border:0">
      <span class="k" data-i18n="lbl-net-after-costs">Net after costs &amp; discounts</span>
      <span class="v">${fmt(inv.totals.taxableNet)}</span>
    </div>`;
}

function renderMobileTotals(inv) {
  const t = inv.totals;
  const lineTotal = t.subtotal + t.shipping + t.discount + t.tax;
  const host = document.getElementById('m-totals-rows');
  host.innerHTML = `
    <div class="m-totrow"><span class="k" data-i18n="lbl-prod-subtotal">Product Subtotal</span><span class="v">${fmt(t.subtotal)}</span></div>
    <div class="m-totrow"><span class="k" data-i18n="lbl-shipping">Shipping Charge</span><span class="v" style="color:var(--success)">+${fmt(t.shipping)}</span></div>
    <div class="m-totrow"><span class="k" data-i18n="lbl-holiday-disc">Holiday Discount (10%)</span><span class="v" style="color:var(--danger)">${fmt(t.discount)}</span></div>
    <div class="m-totrow"><span class="k" data-i18n="lbl-tax-excl">Tax (5% excl.)</span><span class="v">+${fmt(t.tax)}</span></div>
    <div class="m-totrow"><span class="k" style="font-weight:600;color:var(--text)" data-i18n="lbl-inv-total-2">Invoice Total</span><span class="v" style="font-size:16px;color:var(--primary)">${fmt(lineTotal)}</span></div>
    <div class="m-totrow"><span class="k" data-i18n="lbl-dp">Down Payment</span><span class="v" style="color:var(--danger)">−${fmt(t.downPayment)}</span></div>
    <div class="m-totrow" style="border:0"><span class="k" style="font-weight:700;color:var(--text)" data-i18n="lbl-balance-to-finance">Balance to Finance</span><span class="v" style="font-size:15px">${fmt(t.balanceToFinance)}</span></div>`;
}

function renderMobilePaymentSummary(inv) {
  const host = document.getElementById('m-pay-summary');
  const rows = paymentSummaryRows(inv).map(item => {
    const keyAttr = item.keyI18n ? ` data-i18n="${item.keyI18n}"` : '';
    const valStyle = item.valueStyle ? ` style="${item.valueStyle}"` : '';
    return `<div class="m-totrow"><span class="k"${keyAttr}>${item.keyLabel || ''}</span><span class="v"${valStyle}>${item.value}</span></div>`;
  }).join('');
  host.innerHTML = rows + `
    <div class="m-totrow"><span class="k" style="font-weight:700;color:var(--text)" data-i18n="lbl-total-collected">Total Collected</span><span class="v" style="color:var(--success)">${fmt(inv.totals.totalCollected)}</span></div>
    <div class="m-totrow" style="border:0"><span class="k" style="font-weight:700;color:var(--text)" data-i18n="lbl-remaining">Remaining</span><span class="v" style="color:var(--danger)">${fmt(inv.totals.remaining)}</span></div>`;
}

function renderInstallmentBadgesMobile(inv) {
  const counts = inv.installments.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
  const host = document.getElementById('m-plan-badges');
  host.innerHTML = `
    <span class="pill success">${counts.paid || 0}✓</span>
    <span class="pill amber">${(counts.due || 0) + (counts.overdue || 0)} due</span>`;
}

function renderInvoice(inv) {
  renderHeader(inv);
  renderSummaryStrip(inv);
  renderProgress(inv);
  renderInvoiceDetails(inv);
  renderCustomerCard(inv);
  renderAdditionalCosts(inv);
  renderProductSubtotal(inv);
  renderTotalsSidebar(inv);
  renderPaymentSummary(inv);
  renderInstallmentBadges(inv);
  renderHeaderPills(inv);

  AppProductsTable.render(document.getElementById('products-rows'), inv.products);
  AppProductsTable.renderMobile(document.getElementById('m-products-rows'), inv.products);

  AppInstallmentTimeline.render(
    document.getElementById('installments'),
    inv.installments,
    inv.downPayment,
  );
  AppInstallmentTimeline.renderMobile(
    document.getElementById('m-installments'),
    inv.installments,
  );

  AppJournalEntries.render(document.getElementById('journal-rows'), inv.journalEntries);
  AppJournalEntries.renderMobile(document.getElementById('m-journal-rows'), inv.journalEntries);

  AppActivityLog.render(document.getElementById('activity-list'), inv.activity);
  AppActivityLog.render(document.getElementById('m-activity-list'), inv.activity);

  // Mobile-specific renders
  renderMobileInfo(inv);
  renderMobileCustomer(inv);
  renderMobileSummary(inv);
  renderMobileCosts(inv);
  renderMobileTotals(inv);
  renderMobilePaymentSummary(inv);
  renderInstallmentBadgesMobile(inv);
}

/* ─── Bottom sheets ─── */
function openSheet(id) {
  document.getElementById('scrim').classList.add('open');
  document.getElementById(id).classList.add('open');
}
function closeSheets() {
  document.getElementById('scrim').classList.remove('open');
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
}
window.openSheet = openSheet;
window.closeSheets = closeSheets;

/* ─── Pay sheet ─── */
function updateReceipt() {
  if (!invoice) return;
  const balance = invoice.totals.balance;
  const value = parseFloat(document.getElementById('pay-amount').value) || 0;
  const paid = Math.min(balance, Math.max(0, value));
  const remain = Math.max(0, balance - paid);
  setText('r-paid', fmt(paid));
  const rEl = document.getElementById('r-remain');
  rEl.textContent = fmt(remain);
  rEl.style.color = remain === 0 ? 'var(--success)' : 'var(--amber)';
  setText('r-prev', fmt(balance));
}
window.updateReceipt = updateReceipt;

function confirmPayment() {
  alert('Payment recorded successfully!');
  closeSheets();
}
window.confirmPayment = confirmPayment;

document.addEventListener('click', e => {
  const t = e.target.closest('.seg button');
  if (!t) return;
  t.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  t.classList.add('active');
});

AppBootstrap.init({
  i18n: ['demo-i18n-common', 'demo-i18n-invoice-details'],
  afterReady: () => {
    AppDataLoader.load('demo-invoice-installment').then(data => {
      if (!data) return;
      invoice = data;
      renderInvoice(data);
      updateReceipt();
      AppI18n.apply();
    });
  },
});

AppI18n.onChange(() => { if (invoice) { renderInvoice(invoice); updateReceipt(); } });
