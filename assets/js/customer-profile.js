let customer = null;

function buildHeroStats(c) {
  return [
    { tone: 'success', labelKey: 'stat-total-spent',  value: c.stats.totalSpent,    subKey: 'stat-lifetime'         },
    { tone: 'primary', labelKey: 'stat-invoices',     value: c.stats.totalInvoices, subKey: 'stat-all-time'         },
    { tone: 'danger',  labelKey: 'stat-outstanding',  value: c.stats.outstanding,   subKey: 'stat-outstanding-sub'  },
    { tone: 'amber',   labelKey: 'stat-loyalty',      value: c.stats.loyaltyPoints.toLocaleString(), subKey: 'stat-loyalty-sub' },
  ];
}

function buildContactRows(c) {
  return [
    { keyI18n: 'k-customer-id', value: '#' + c.id, mono: true },
    { keyI18n: 'k-email', value: '<span style="font-size:12.5px">' + c.email + '</span>' },
    { keyI18n: 'k-phone', value: c.phone, mono: true },
    { keyI18n: 'k-segment', value: '<span data-i18n="val-retail">' + c.segment + '</span>' },
    { keyI18n: 'k-store', value: '<span data-i18n="val-flagship">' + c.store + '</span>' },
    { keyI18n: 'k-since', value: c.since },
    { keyI18n: 'k-currency', value: c.currency },
  ];
}

function buildBalanceRows(c) {
  return [
    { keyI18n: 'k-total-spent', value: c.stats.totalSpent, valueStyle: 'color:var(--success)' },
    { keyI18n: 'k-total-paid',  value: c.stats.totalPaid },
    { keyI18n: 'k-outstanding', value: c.stats.outstanding, valueStyle: 'color:var(--danger)' },
    { keyI18n: 'k-overdue',     value: c.stats.overdue,     valueStyle: 'color:var(--danger)' },
  ];
}

function buildMobileContactRows(c) {
  return [
    { keyI18n: 'k-email',   value: '<span style="font-size:12px">' + c.email + '</span>' },
    { keyI18n: 'k-phone',   value: c.phone, mono: true },
    { keyI18n: 'k-segment', value: '<span data-i18n="val-retail">' + c.segment + '</span>' },
    { keyI18n: 'k-since',   value: c.since },
  ];
}

function renderHistory() {
  const list = document.getElementById('inv-history-rows');
  list.innerHTML = '';
  customer.history.forEach(inv => {
    const row = document.createElement('div');
    row.className = 'inv-row';
    row.onclick = () => { window.location.href = AppInvoiceRow.detailsUrl(inv); };
    row.innerHTML = AppInvoiceRow.historyRowHtml(inv);
    list.appendChild(row);
  });

  const mList = document.getElementById('m-inv-history-rows');
  mList.innerHTML = '';
  customer.history.slice(0, 3).forEach(inv => {
    const row = document.createElement('div');
    row.className = 'm-inv-row';
    row.innerHTML = AppInvoiceRow.mobileHistoryRowHtml(inv);
    mList.appendChild(row);
  });
}

function renderProfile() {
  const c = customer;
  document.getElementById('cust-initial').textContent = c.initial;
  document.getElementById('m-cust-initial').textContent = c.initial;
  document.getElementById('cust-name').textContent = c.name;
  document.getElementById('m-cust-name').textContent = c.name;
  document.getElementById('m-cust-name-2').textContent = c.name;
  document.getElementById('cust-email').textContent = c.email;
  document.getElementById('cust-phone').textContent = c.phone;
  document.getElementById('cust-since').textContent = c.since;
  document.getElementById('cust-id-pill').textContent = '#' + c.id;
  document.getElementById('m-cust-sub').textContent = c.email + ' · ' + c.phone;
  document.getElementById('inv-count').textContent = c.stats.totalInvoices;
  document.getElementById('m-inv-count').textContent = c.stats.totalInvoices;

  document.getElementById('loyalty-tier').textContent = c.tier;
  document.getElementById('loyalty-progress').textContent = c.stats.loyaltyPoints.toLocaleString() + ' / ' + c.stats.loyaltyTarget.toLocaleString() + ' pts';
  document.getElementById('m-loyalty-progress').textContent = c.stats.loyaltyPoints.toLocaleString() + ' pts';
  document.getElementById('loyalty-fill').style.width = c.stats.loyaltyProgressPct + '%';
  document.getElementById('m-loyalty-fill').style.width = c.stats.loyaltyProgressPct + '%';

  AppStatsStrip.render(document.getElementById('customer-stats'), buildHeroStats(c));
  // Mobile uses a simpler grid layout (m-stat instead of stat-cell)
  const mStats = document.getElementById('m-customer-stats');
  mStats.innerHTML = `
    <div class="m-stat success"><div class="lbl" data-i18n="stat-total-spent">Total Spent</div><div class="val">${c.stats.totalSpent}</div></div>
    <div class="m-stat primary"><div class="lbl" data-i18n="stat-invoices">Invoices</div><div class="val">${c.stats.totalInvoices}</div></div>
    <div class="m-stat danger"><div class="lbl" data-i18n="stat-outstanding">Outstanding</div><div class="val">${c.stats.outstanding}</div></div>
    <div class="m-stat"><div class="lbl" data-i18n="stat-loyalty">Points</div><div class="val" style="color:var(--amber)">${c.stats.loyaltyPoints.toLocaleString()}</div></div>`;

  AppInfoRows.render(document.getElementById('contact-info-rows'), buildContactRows(c));
  AppInfoRows.render(document.getElementById('balance-info-rows'), buildBalanceRows(c));
  AppInfoRows.render(document.getElementById('m-contact-info-rows'), buildMobileContactRows(c), { mobile: true });
  AppPaymentList.renderPayments(document.getElementById('payment-history-list'), c.payments);
  AppPaymentList.renderNotes(document.getElementById('notes-list'), c.notes);

  renderHistory();
}

AppBootstrap.init({
  i18n: ['demo-i18n-common', 'demo-i18n-customer-profile'],
  afterReady: () => {
    AppDataLoader.load('demo-customer').then(data => {
      if (!data) return;
      customer = data;
      renderProfile();
      AppI18n.apply();
    });
  },
});

AppI18n.onChange(() => { if (customer) renderHistory(); });
