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
