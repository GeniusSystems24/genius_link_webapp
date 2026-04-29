let outstandingInvoices = [];
let allocations = [];
let selectedInv = 0;
let stepper = null;

function renderInvOptions(container) {
  container.innerHTML = '';
  outstandingInvoices.forEach((inv, i) => {
    const el = document.createElement('div');
    el.className = 'inv-option' + (i === selectedInv ? ' selected' : '');
    el.onclick = () => { selectedInv = i; renderInvOptions(container); };
    el.innerHTML = `
      <div class="check">${i === selectedInv ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-11"/></svg>' : ''}</div>
      <div class="info">
        <div class="ref">${inv.ref}</div>
        <div class="cust">${inv.cust}</div>
        <div class="sub">${inv.sub}</div>
      </div>
      <div>
        <div class="balance">$${inv.balance.toFixed(2)}</div>
        <div class="badge" style="margin-top:5px;font-size:10.5px">${inv.note}</div>
      </div>`;
    container.appendChild(el);
  });
}

function renderAllocItems(container) {
  container.innerHTML = '';
  allocations.forEach(item => {
    const el = document.createElement('div');
    el.className = 'alloc-item' + (item.overdue ? ' overdue' : '') + (item.checked ? ' selected' : '');
    el.innerHTML = `<input type="checkbox" ${item.checked ? 'checked' : ''}/><div class="al"><div class="t">${item.label}</div><div class="s">${item.sub}</div></div><div class="amt">$${item.amount.toFixed(2)}</div>`;
    container.appendChild(el);
  });
}

function setAmt(v) {
  document.getElementById('pay-amount').value = v;
  updateSummary();
}

function updateSummary() {
  const a = parseFloat(document.getElementById('pay-amount').value) || 0;
  const r = Math.max(0, 41.66 - a);
  const formatted = '$' + a.toFixed(2);
  document.getElementById('s-this').textContent = formatted;
  document.getElementById('s-after').textContent = '$' + r.toFixed(2);
  document.getElementById('je-dr').textContent = 'DR ' + formatted;
  document.getElementById('je-cr').textContent = 'CR ' + formatted;
  document.getElementById('rev-amount').textContent = formatted;
  document.getElementById('receipt-amount').textContent = formatted;
  document.getElementById('receipt-remaining').textContent = '$' + r.toFixed(2);
  document.getElementById('final-remaining').textContent = '$' + r.toFixed(2);
}

function updateMobileNavLabels(stepNum) {
  const footer = document.getElementById('m-footer');
  const btnBack = document.getElementById('m-btn-back');
  const btnNext = document.getElementById('m-btn-next');
  footer.style.display = stepNum === 4 ? 'none' : '';
  btnBack.style.display = stepNum === 1 ? 'none' : '';
  btnNext.textContent = stepNum === 3
    ? AppI18n.t('btn-confirm-post')
    : AppI18n.t('btn-next');
}

// Segmented control toggle
document.addEventListener('click', e => {
  const t = e.target.closest('.seg button');
  if (!t) return;
  t.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  t.classList.add('active');
});

AppBootstrap.init({
  i18n: ['demo-i18n-common', 'demo-i18n-record-payment'],
  afterReady: () => {
    AppDataLoader.load('demo-payment-options').then(data => {
      if (!data) return;
      outstandingInvoices = data.outstandingInvoices;
      allocations = data.allocations;

      renderInvOptions(document.getElementById('inv-options'));
      renderInvOptions(document.getElementById('m-inv-options'));
      renderAllocItems(document.getElementById('alloc-items'));
      renderAllocItems(document.getElementById('m-alloc-items'));

      stepper = AppStepper.create({
        steps: [
          { id: 1, labelKey: 'step-1' },
          { id: 2, labelKey: 'step-2' },
          { id: 3, labelKey: 'step-3' },
          { id: 4, labelKey: 'step-4' },
        ],
        onChange: updateMobileNavLabels,
      });
      stepper.go(1);

      AppI18n.apply();
    });
  },
});

AppI18n.onChange(() => { if (stepper) updateMobileNavLabels(stepper.get()); });
