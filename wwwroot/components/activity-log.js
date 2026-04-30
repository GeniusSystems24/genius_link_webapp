/* Activity log component — renders activity entries with a colored icon.
 * Entry: { type: 'created'|'paid'|'reminder'|'print'|'refund', title, ts }. */
(function () {
  const ICONS = {
    created:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    paid:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5 9-11"/></svg>',
    reminder: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>',
    print:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>',
    refund:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 009 9 9 9 0 009-9 9 9 0 00-9-9M3 12l3-3m-3 3l3 3"/></svg>',
  };

  function itemHtml(a) {
    const icon = ICONS[a.type] || ICONS.created;
    return `<div class="act-item">
      <div class="act-icon ${a.type}">${icon}</div>
      <div class="act-body">
        <div class="at">${a.title}</div>
        <div class="ts">${a.ts}</div>
      </div>
    </div>`;
  }

  function render(host, items) {
    const wrapper = host.querySelector('.activity') || host;
    if (host.querySelector('.activity')) {
      host.querySelector('.activity').innerHTML = items.map(itemHtml).join('');
    } else {
      host.innerHTML = `<div class="activity">${items.map(itemHtml).join('')}</div>`;
    }
  }

  window.AppActivityLog = { render, itemHtml };
})();
