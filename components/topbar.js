/* Topbar component — renders the sticky brand + breadcrumbs + toggle row.
 *
 * Usage:
 *   <div data-component="topbar"
 *        data-brand-href="Invoice List.html"
 *        data-crumbs='[{"label":"Invoices","href":"Invoice List.html","key":"nav-invoices"},{"label":"INV-2023-007"}]'>
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
    const brandHref = host.dataset.brandHref || 'Invoice List.html';
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
