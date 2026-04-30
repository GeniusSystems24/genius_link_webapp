let invoices = [];
let activeFilter = 'all';
let searchQuery = '';

function renderRows() {
  const list = document.getElementById('invoice-rows');
  const mc = document.getElementById('m-invoice-cards');
  const filtered = invoices.filter(inv => {
    if (activeFilter !== 'all' && inv.status !== activeFilter) return false;
    if (searchQuery && !inv.ref.toLowerCase().includes(searchQuery) && !inv.cust.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  list.innerHTML = '';
  filtered.forEach(inv => {
    const row = document.createElement('div');
    row.className = 'inv-row';
    row.onclick = () => { window.location.href = AppInvoiceRow.detailsUrl(inv); };
    row.innerHTML = AppInvoiceRow.tableRowHtml(inv);
    list.appendChild(row);
  });
  document.getElementById('pag-info').textContent = `Showing 1–${filtered.length} of 248`;

  mc.innerHTML = '';
  filtered.forEach(inv => {
    const card = document.createElement('div');
    card.className = 'm-inv-card';
    card.onclick = () => { window.location.href = AppInvoiceRow.detailsUrl(inv); };
    card.innerHTML = AppInvoiceRow.mobileCardHtml(inv);
    mc.appendChild(card);
  });
}

function setFilter(f) {
  activeFilter = f;
  document.querySelectorAll('.filter-chip').forEach(c => c.style.opacity = '0.5');
  const chip = document.getElementById('chip-' + f);
  if (chip) chip.style.opacity = '1';
  renderRows();
}

function filterRows() {
  searchQuery = document.getElementById('search-input').value.toLowerCase();
  renderRows();
}

function openSheet(id) {
  document.getElementById('scrim').classList.add('open');
  document.getElementById(id).classList.add('open');
}

function closeSheets() {
  document.getElementById('scrim').classList.remove('open');
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
}

function buildStats(summary) {
  return [
    { tone: '',        labelKey: 'stat-total',       value: summary.totalCount,         subKey: 'stat-total-sub'       },
    { tone: 'success', labelKey: 'stat-revenue',     value: summary.revenue,            subKey: 'stat-revenue-sub'     },
    { tone: 'primary', labelKey: 'stat-outstanding', value: summary.outstanding,        subKey: 'stat-outstanding-sub' },
    { tone: 'danger',  labelKey: 'stat-overdue',     value: summary.overdue,            subKey: 'stat-overdue-sub'     },
  ];
}

AppBootstrap.init({
  i18n: ['demo-i18n-common', 'demo-i18n-invoice-list'],
  afterReady: () => {
    AppDataLoader.load('demo-invoices').then(data => {
      if (!data) return;
      invoices = data.list;
      AppStatsStrip.render(document.getElementById('invoice-stats'), buildStats(data.summary));
      AppI18n.apply();
      renderRows();
    });
  },
});

// Re-render rows whenever language changes (status / type labels are localised).
AppI18n.onChange(() => { if (invoices.length) renderRows(); });
