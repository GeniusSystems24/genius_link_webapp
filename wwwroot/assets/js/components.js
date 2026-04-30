/* Shared page helpers for legacy static page behavior.
 * This file keeps existing page scripts working while Blazor components
 * live under Components/Shared. */


/* ===== topbar ===== */
/* Topbar component — renders the sticky brand + breadcrumbs + toggle row.
 *
 * Usage:
 *   <div data-component="topbar"
 *        data-brand-href="/invoice-list"
 *        data-crumbs='[{"label":"Invoices","href":"/invoice-list","key":"nav-invoices"},{"label":"INV-2023-007"}]'>
 *   </div>
 */
(function () {
  const VIEW_DESKTOP_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';
  const VIEW_MOBILE_ICON  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></svg>';
  const LANG_ICON  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 010 18M3 12h18"/></svg>';
  const THEME_ICON = '<svg id="theme-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const ARROW_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';

  function renderCrumb(c) {
    const i18n = c.key ? ` data-i18n="${c.key}"` : '';
    return c.href
      ? `<a href="${c.href}"${i18n}>${c.label}</a>`
      : `<span${i18n}>${c.label}</span>`;
  }

  function render(host) {
    const brandHref = host.dataset.brandHref || '/invoice-list';
    const brandText = host.dataset.brandText || 'Ledgerly';
    const brandMark = host.dataset.brandMark || 'L';
    let crumbs = [];
    try { crumbs = JSON.parse(host.dataset.crumbs || '[]'); } catch (_) {}

    const crumbsHtml = crumbs
      .map(renderCrumb)
      .join(`\n      ${ARROW_ICON}\n      `);

    host.outerHTML = `
<div class="topbar">
  <a class="brand" href="${brandHref}"><div class="brand-mark">${brandMark}</div><span>${brandText}</span></a>
  <div class="crumbs">
      ${crumbsHtml}
  </div>
  <div class="topbar-spacer"></div>
  <div class="view-toggle">
    <button id="view-desktop" class="active" data-view="desktop">${VIEW_DESKTOP_ICON}Desktop</button>
    <button id="view-mobile" data-view="mobile">${VIEW_MOBILE_ICON}Mobile</button>
  </div>
  <button class="lang-toggle" id="lang-toggle">${LANG_ICON}<span id="lang-label">عربي</span></button>
  <button class="theme-toggle" id="theme-toggle">${THEME_ICON}<span id="theme-label">Light</span></button>
</div>`;
  }

  function init() {
    document.querySelectorAll('[data-component="topbar"]').forEach(render);
  }

  window.AppTopbar = { init, render };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* ===== status badge ===== */
/* Status badge component — renders a colored pill with a leading dot.
 * Status keys (paid|partial|overdue|draft|voided) drive the visual style and
 * are translated through AppI18n with the "status-" prefix. */
(function () {
  function html(status, opts) {
    const o = opts || {};
    const lang = o.lang || (window.AppI18n && window.AppI18n.getLang());
    const label = o.label || (window.AppI18n
      ? window.AppI18n.t('status-' + status, lang)
      : status);
    const size = o.small ? 'font-size:10.5px' : '';
    return `<span class="status-badge ${status}" style="${size}"><span class="dot"></span>${label}</span>`;
  }

  window.AppStatusBadge = { html };
})();


/* ===== invoice type pill ===== */
/* Sale type pill — renders a colored badge for the invoice type
 * (cash | installment | credit | advance). */
(function () {
  function html(type, opts) {
    const o = opts || {};
    const lang = o.lang || (window.AppI18n && window.AppI18n.getLang());
    const label = window.AppI18n
      ? window.AppI18n.t('type-' + type, lang)
      : type;
    return `<span class="inv-type ${type}">${label}</span>`;
  }

  window.AppInvTypePill = { html };
})();


/* ===== info rows ===== */
/* Info rows — renders a vertical key/value list. Suitable for sidebar cards
 * and the mobile info panels.
 *
 * Item shape: { keyLabel, keyI18n, value, valueClass, mono } */
(function () {
  function rowHtml(item, mobile) {
    const cls = mobile ? 'm-info-row' : 'q-row';
    const valClasses = ['v'];
    if (item.mono) valClasses.push('mono');
    if (item.valueClass) valClasses.push(item.valueClass);
    const keyAttr = item.keyI18n ? ` data-i18n="${item.keyI18n}"` : '';
    const keyLabel = item.keyLabel
      || (item.keyI18n && window.AppI18n ? window.AppI18n.t(item.keyI18n) : '')
      || '';
    return `<div class="${cls}">
      <span class="k"${keyAttr}>${keyLabel}</span>
      <span class="${valClasses.join(' ')}"${item.valueStyle ? ` style="${item.valueStyle}"` : ''}>${item.value}</span>
    </div>`;
  }

  function render(host, items, opts) {
    const o = opts || {};
    host.innerHTML = items.map(item => rowHtml(item, o.mobile)).join('');
  }

  window.AppInfoRows = { render, rowHtml };
})();


/* ===== stats strip ===== */
/* Stats strip — renders 4 stat cells from a config array.
 *
 * Each stat: { tone, labelKey|label, value, subKey|sub }
 * tone may be: '' | 'success' | 'danger' | 'primary' | 'amber' */
(function () {
  function cellHtml(stat) {
    const tone = stat.tone ? ` ${stat.tone}` : '';
    const label = stat.labelKey
      ? `<div class="lbl" data-i18n="${stat.labelKey}">${stat.label || ''}</div>`
      : `<div class="lbl">${stat.label || ''}</div>`;
    const sub = stat.subKey
      ? `<div class="sub" data-i18n="${stat.subKey}">${stat.sub || ''}</div>`
      : (stat.sub ? `<div class="sub">${stat.sub}</div>` : '');
    return `<div class="stat-cell${tone}">${label}<div class="val">${stat.value}</div>${sub}</div>`;
  }

  function render(host, stats) {
    host.classList.add('stats-strip');
    host.innerHTML = stats.map(cellHtml).join('');
  }

  window.AppStatsStrip = { render, cellHtml };
})();


/* ===== invoice row ===== */
/* Invoice row component — produces both the desktop table row and the mobile
 * card markup for a single invoice. Status / sale-type rendering is delegated
 * to the status-badge and inv-type-pill components. */
(function () {
  const VIEW_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const MORE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>';

  function route(name, fallback) {
    return (window.GeniusRoutes && window.GeniusRoutes[name]) || fallback;
  }

  function detailsUrl(inv) {
    return inv.type === 'cash'
      ? route('saleInvoiceDetailsCash', '/sale-invoice-details-cash')
      : route('saleInvoiceDetails', '/sale-invoice-details');
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


/* ===== payment list ===== */
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


/* ===== products table ===== */
/* Products table component — produces both the desktop product rows and the
 * compact mobile rows. Each product object is { icon, name, sku, skuSub?, qty,
 * price, discount?, total }. */
(function () {
  function discountCell(discount) {
    if (!discount) return '<div>—</div>';
    const sign = discount < 0 ? '−' : '+';
    return `<div><span class="pill danger">${sign}$${Math.abs(discount).toFixed(2)}</span></div>`;
  }

  function rowHtml(p) {
    const skuLine = p.skuSub
      ? `${p.sku} · ${p.skuSub}`
      : p.sku;
    return `
      <div class="ptrow">
        <div class="pname">
          <div class="pthumb">${p.icon || '📦'}</div>
          <div><div class="pt">${p.name}</div><div class="ps mono">${skuLine}</div></div>
        </div>
        <div class="num">${p.qty}</div>
        <div class="num">$${p.price.toFixed(2)}</div>
        ${discountCell(p.discount)}
        <div class="num" style="text-align:right;font-weight:700">$${p.total.toFixed(2)}</div>
      </div>`;
  }

  function mobileRowHtml(p) {
    const meta = `Qty ${p.qty} · $${p.price.toFixed(2)} ea`;
    if (p.discount) {
      const sign = p.discount < 0 ? '−' : '+';
      return `
        <div class="m-prod">
          <div class="m-prod-icon">${p.icon || '📦'}</div>
          <div><div style="font-weight:600;font-size:13.5px">${p.name}</div><div style="font-size:11.5px;color:var(--text-dim)">${meta}</div></div>
          <div style="text-align:right">
            <div style="font-weight:700;font-variant-numeric:tabular-nums">$${p.total.toFixed(2)}</div>
            <span class="pill danger" style="font-size:10px">${sign}$${Math.abs(p.discount).toFixed(2)}</span>
          </div>
        </div>`;
    }
    return `
      <div class="m-prod">
        <div class="m-prod-icon">${p.icon || '📦'}</div>
        <div><div style="font-weight:600;font-size:13.5px">${p.name}</div><div style="font-size:11.5px;color:var(--text-dim)">${meta}</div></div>
        <div style="font-weight:700;font-variant-numeric:tabular-nums">$${p.total.toFixed(2)}</div>
      </div>`;
  }

  function render(host, products) {
    host.innerHTML = products.map(rowHtml).join('');
  }

  function renderMobile(host, products) {
    host.innerHTML = products.map(mobileRowHtml).join('');
  }

  window.AppProductsTable = { render, renderMobile, rowHtml, mobileRowHtml };
})();


/* ===== installment timeline ===== */
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


/* ===== journal entries ===== */
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


/* ===== activity log ===== */
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


/* ===== stepper ===== */
/* Stepper component — drives a horizontal step indicator (desktop) and the
 * compact mobile variant. Steps are described by an array of { id, labelKey }
 * passed during init. The component manages active/done state and panel
 * visibility (any element with id `panel-N` / `m-panel-N`).
 */
(function () {
  const CHECK_DESKTOP = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5 9-11"/></svg>';
  const CHECK_MOBILE  = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-11"/></svg>';

  function create(opts) {
    const steps = opts.steps;
    const total = steps.length;
    let current = 1;

    function applyDesktop(n) {
      steps.forEach((step, idx) => {
        const i = idx + 1;
        const circle = document.getElementById('sc-' + i);
        const lineEl = document.getElementById('sl-' + i);
        if (!circle) return;
        circle.className = 'step-circle';
        if (i < n) {
          circle.classList.add('done');
          circle.innerHTML = CHECK_DESKTOP;
        } else if (i === n) {
          circle.classList.add('active');
          circle.textContent = i;
        } else {
          circle.textContent = i;
        }
        const lbl = circle.closest('.step-wrap')?.querySelector('.step-label');
        if (lbl) {
          lbl.className = 'step-label';
          if (i < n) lbl.classList.add('done');
          else if (i === n) lbl.classList.add('active');
        }
        if (lineEl && i < total) {
          lineEl.className = 'step-line' + (i < n ? ' done' : '');
        }
      });
      document.querySelectorAll('.desktop-wrap .step-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + n);
      if (panel) panel.classList.add('active');
    }

    function applyMobile(n) {
      steps.forEach((step, idx) => {
        const i = idx + 1;
        const c = document.getElementById('m-sc-' + i);
        const lineEl = document.getElementById('m-sl-' + i);
        if (!c) return;
        c.className = 'm-step';
        if (i < n) {
          c.classList.add('done');
          c.innerHTML = CHECK_MOBILE;
        } else if (i === n) {
          c.classList.add('active');
          c.textContent = i;
        } else {
          c.textContent = i;
        }
        if (lineEl && i < total) {
          lineEl.className = 'm-line' + (i < n ? ' done' : '');
        }
      });
      document.querySelectorAll('.mobile-wrap .step-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('m-panel-' + n);
      if (panel) panel.classList.add('active');
      const titleEl = document.getElementById('m-step-title');
      if (titleEl && window.AppI18n) {
        titleEl.textContent = window.AppI18n.t(steps[n - 1].labelKey);
      }
    }

    function go(n) {
      current = Math.min(total, Math.max(1, n));
      applyDesktop(current);
      applyMobile(current);
      if (typeof opts.onChange === 'function') opts.onChange(current);
    }

    function next() { go(current + 1); }
    function back() { go(current - 1); }
    function get() { return current; }

    return { go, next, back, get };
  }

  window.AppStepper = { create };
})();


/* ===== bottom sheets ===== */
/* bottom-sheets.js — Renders all bottom-sheet overlays used by Create Sale Invoice.
 *
 * Usage:  Place one placeholder anywhere in <body>:
 *   <div data-component="bottom-sheets"></div>
 *
 * The component replaces the placeholder with the scrim + every sheet element.
 */
(function () {

  const CLOSE_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M6 18L18 6"/></svg>`;

  const HTML = `
  <!-- Sheet scrim -->
  <div class="sheet-scrim" id="scrim" onclick="closeAllSheets()"></div>

  <!-- Customer -->
  <div class="sheet" id="sheet-customer">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <div>
        <h3>Select Customer</h3>
        <div class="sub">Tap to choose, search by name or ID</div>
      </div>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="input-with-icon" style="margin-bottom:10px">
        <input class="input" placeholder="Search customers…"/>
        <span class="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></span>
      </div>
      <div class="list-pick" id="customer-list"></div>
    </div>
    <div class="sheet-footer">
      <button class="btn" onclick="closeAllSheets()">Cancel</button>
      <button class="btn primary" style="justify-content:center" onclick="closeAllSheets()">Confirm Selection</button>
    </div>
  </div>

  <!-- Currency -->
  <div class="sheet" id="sheet-currency">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <h3>Currency</h3>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="list-pick" id="currency-list"></div>
    </div>
    <div class="sheet-footer single">
      <button class="btn primary" style="justify-content:center" onclick="closeAllSheets()">Done</button>
    </div>
  </div>

  <!-- Store -->
  <div class="sheet" id="sheet-store">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <h3>Store Location</h3>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="list-pick" id="store-list"></div>
    </div>
    <div class="sheet-footer single">
      <button class="btn primary" style="justify-content:center" onclick="closeAllSheets()">Done</button>
    </div>
  </div>

  <!-- Down-payment account -->
  <div class="sheet" id="sheet-dpacct">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <div>
        <h3>Down Payment Account</h3>
        <div class="sub">Where the cash is received</div>
      </div>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="list-pick" id="dpacct-list"></div>
    </div>
    <div class="sheet-footer single">
      <button class="btn primary" style="justify-content:center" onclick="closeAllSheets()">Done</button>
    </div>
  </div>

  <!-- Product Picker -->
  <div class="sheet" id="sheet-product-pick">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <div>
        <h3>Add Product</h3>
        <div class="sub">Search the catalog or scan a barcode</div>
      </div>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="input-with-icon" style="margin-bottom:10px">
        <input class="input" placeholder="Search products or scan…"/>
        <span class="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v16M12 4v16M16 4v16"/></svg></span>
      </div>
      <div class="list-pick" id="catalog-list"></div>
    </div>
  </div>

  <!-- Product Edit -->
  <div class="sheet" id="sheet-product-edit">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <div>
        <h3 id="pe-title">Edit Product</h3>
        <div class="sub" id="pe-sku">SKU —</div>
      </div>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="m-field"><label>Quantity</label>
        <div class="step">
          <button onclick="pmQty(-1)">−</button>
          <input id="pe-qty" value="1" inputmode="numeric"/>
          <button onclick="pmQty(1)">+</button>
        </div>
      </div>
      <div class="m-field"><label>Unit Price</label><input class="input mono" id="pe-price" value="0.00" inputmode="decimal"/></div>
      <div class="m-field"><label>Line Discount</label>
        <div class="seg" id="pe-disc-type">
          <button class="active" data-v="amount">Amount ($)</button>
          <button data-v="percent">Percent (%)</button>
        </div>
        <input class="input mono" id="pe-disc-val" value="0" inputmode="decimal" style="margin-top:8px"/>
      </div>
      <div class="m-field"><label>Note</label><textarea class="textarea" id="pe-note" placeholder="Optional line note…" style="min-height:70px"></textarea></div>
      <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-top:12px">
        <div class="kv"><span class="k">Gross</span><span class="v num" id="pe-gross">$0.00</span></div>
        <div class="kv"><span class="k">Discount</span><span class="v num" id="pe-disc-amt" style="color:var(--danger)">−$0.00</span></div>
        <div class="kv"><span class="k" style="font-weight:600;color:var(--text)">Line Total</span><span class="v num" id="pe-line-total" style="color:var(--primary);font-size:15px">$0.00</span></div>
      </div>
    </div>
    <div class="sheet-footer">
      <button class="btn danger-ghost" onclick="pmRemove()">Remove</button>
      <button class="btn primary" style="justify-content:center" onclick="pmSave()">Save Changes</button>
    </div>
  </div>

  <!-- Cost sheet -->
  <div class="sheet" id="sheet-cost">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <div>
        <h3 id="cs-title">Add Additional Cost</h3>
        <div class="sub">Charge or discount applied to this invoice</div>
      </div>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="m-field"><label data-i18n="lbl-desc">Description</label><input class="input" id="cs-desc" placeholder="e.g. Shipping, Tip, Loyalty Discount"/></div>
      <div class="m-field"><label>Type</label>
        <div class="seg" id="cs-type">
          <button class="active" data-v="charge">+ Charge</button>
          <button data-v="discount">− Discount</button>
        </div>
      </div>
      <div class="m-field"><label>Calculation</label>
        <div class="seg" id="cs-mode">
          <button class="active" data-v="fixed">Fixed ($)</button>
          <button data-v="percent">Percent (%)</button>
        </div>
      </div>
      <div class="m-row2">
        <div class="m-field"><label id="cs-val-lbl">Amount ($)</label><input class="input mono" id="cs-val" value="0.00" inputmode="decimal"/></div>
        <div class="m-field"><label>Computed Amount</label><input class="input mono" id="cs-computed" value="$0.00" disabled/></div>
      </div>
    </div>
    <div class="sheet-footer">
      <button class="btn danger-ghost" id="cs-remove" onclick="csRemove()" style="display:none">Remove</button>
      <button class="btn" onclick="closeAllSheets()" id="cs-cancel">Cancel</button>
      <button class="btn primary" style="grid-column:span 1;justify-content:center" onclick="csSave()">Save</button>
    </div>
  </div>

  <!-- Date picker -->
  <div class="sheet" id="sheet-date">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <h3 id="cal-title">Select Date</h3>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="cal">
        <div class="cal-head">
          <button onclick="calNav(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg></button>
          <span id="cal-month">—</span>
          <button onclick="calNav(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 6l6 6-6 6"/></svg></button>
        </div>
        <div class="cal-grid" id="cal-grid"></div>
      </div>
    </div>
    <div class="sheet-footer">
      <button class="btn" onclick="closeAllSheets()">Cancel</button>
      <button class="btn primary" style="justify-content:center" onclick="calConfirm()">Set Date</button>
    </div>
  </div>

  <!-- Manual barcode -->
  <div class="sheet" id="sheet-manual">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <h3>Enter Barcode</h3>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="m-field"><label>Barcode</label><input class="input mono" placeholder="e.g. 0123456789012" inputmode="numeric"/></div>
    </div>
    <div class="sheet-footer">
      <button class="btn" onclick="closeAllSheets()">Cancel</button>
      <button class="btn primary" style="justify-content:center" onclick="closeAllSheets()">Look Up</button>
    </div>
  </div>

  <!-- Installment plan config -->
  <div class="sheet" id="sheet-plan-config">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <h3>Installment Plan</h3>
      <button class="icon-btn" onclick="closeAllSheets()">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      <div class="m-field"><label>Installments</label>
        <div class="step">
          <button onclick="adjPlanN(-1)">−</button>
          <input id="sp-n" value="3" inputmode="numeric"/>
          <button onclick="adjPlanN(1)">+</button>
        </div>
      </div>
      <div class="m-field"><label data-i18n="lbl-plan-freq">Frequency</label>
        <div class="seg three" id="sp-freq">
          <button class="active" data-v="Monthly">Monthly</button>
          <button data-v="Bi-weekly">Bi-weekly</button>
          <button data-v="Weekly">Weekly</button>
        </div>
      </div>
      <div class="m-field"><label data-i18n="lbl-plan-start">Start Date</label>
        <button class="m-picker" onclick="openDate('sp-start')">
          <span id="sp-start">12/01/2023</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
        </button>
      </div>
      <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-top:12px">
        <div class="kv"><span class="k">Installment Base</span><span class="v num" id="sp-base">$0.00</span></div>
        <div class="kv"><span class="k">Per-Installment</span><span class="v num" id="sp-per" style="color:var(--primary)">$0.00</span></div>
      </div>
    </div>
    <div class="sheet-footer">
      <button class="btn" onclick="closeAllSheets()">Cancel</button>
      <button class="btn primary" style="justify-content:center" onclick="applyPlanConfig()">Apply</button>
    </div>
  </div>
`;

  function init() {
    document.querySelectorAll('[data-component="bottom-sheets"]').forEach(function (host) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = HTML;
      host.replaceWith(...wrapper.childNodes);
    });
  }

  window.BottomSheets = { init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

