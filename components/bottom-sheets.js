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
