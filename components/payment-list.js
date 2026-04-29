/* Payment list — renders payment activity entries inside an .act-item list. */
(function () {
  const PAY_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5 9-11"/></svg>';
  const NOTE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h5"/></svg>';

  function paymentItem(p) {
    const fmt = window.AppFormat;
    return `<div class="act-item">
      <div class="act-icon payment">${PAY_ICON}</div>
      <div class="act-body">
        <div class="at">${fmt.money(p.amount)} — ${p.ref} ${p.label}</div>
        <div class="ts">${p.date} · ${p.account}</div>
      </div>
    </div>`;
  }

  function noteItem(n) {
    const text = window.AppI18n ? window.AppI18n.t(n.key) : n.text || n.key;
    return `<div class="act-item">
      <div class="act-icon note">${NOTE_ICON}</div>
      <div class="act-body">
        <div class="at" data-i18n="${n.key}">${text}</div>
        <div class="ts">${n.date} · ${n.author}</div>
      </div>
    </div>`;
  }

  function renderPayments(host, items) {
    host.innerHTML = items.map(paymentItem).join('');
  }

  function renderNotes(host, items) {
    host.innerHTML = items.map(noteItem).join('');
  }

  window.AppPaymentList = { renderPayments, renderNotes, paymentItem, noteItem };
})();
