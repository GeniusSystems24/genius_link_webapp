/* ============ STATE ============ */

let CATALOG = [];
let CUSTOMERS = [];
let STORES = [];
let CURRENCIES = [];
let DP_ACCOUNTS = [];

    
    
    
    
    

    // products & costs as arrays of objects (desktop + mobile share this)
    let products = [];
    let costs = [];
    let nextPid = 3, nextCid = 3;
    let editingPid = null, editingCid = null;
    let planCfg = {};

    /* ============ UTIL ============ */
    function fmt(n) {
      if (Number.isNaN(n) || n == null) n = 0;
      const sign = n < 0 ? '−' : '';
      return sign + '$' + Math.abs(n).toFixed(2);
    }
    function round2(n) { return Math.round(n * 100) / 100; }
    function parseNum(s) { const n = parseFloat(String(s).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; }

    function lineGross(p) { return (p.price || 0) * (p.qty || 0); }
    function lineDiscount(p) {
      const g = lineGross(p);
      if ((p.discVal || 0) <= 0) return 0;
      return p.discType === 'percent' ? round2(g * (p.discVal / 100)) : Math.min(g, round2(p.discVal));
    }
    function lineTotal(p) { return round2(lineGross(p) - lineDiscount(p)); }

    function costAmount(c, base) {
      const v = c.val || 0;
      const raw = c.mode === 'percent' ? base * (v / 100) : v;
      return c.type === 'discount' ? -round2(raw) : round2(raw);
    }

    /* ============ ENGINE ============ */
    function compute() {
      const subtotal = round2(products.reduce((s, p) => s + lineTotal(p), 0));
      let charges = 0, discounts = 0;
      costs.forEach(c => {
        const amt = costAmount(c, subtotal);
        if (amt >= 0) charges += amt; else discounts += amt;
      });
      charges = round2(charges); discounts = round2(discounts);
      const net = round2(subtotal + charges + discounts); // discounts already negative
      const scheme = document.getElementById('tax-scheme').value;
      const rate = Math.max(0, parseNum(document.getElementById('tax-rate').value));
      let tax = 0, total = net;
      if (scheme === 'exclusive') { tax = round2(net * rate / 100); total = round2(net + tax); }
      else if (scheme === 'inclusive') { tax = round2(net - net / (1 + rate / 100)); total = net; }
      else { tax = 0; total = net; }

      const dpOn = document.getElementById('dp-switch').classList.contains('on');
      const dp = dpOn ? Math.min(total, Math.max(0, parseNum(document.getElementById('dp-amount').value))) : 0;
      const balance = round2(total - dp);

      return { subtotal, charges, discounts, net, rate, tax, total, dp, balance, scheme };
    }

    function render() {
      renderProducts();
      renderCosts();
      renderMobileProducts();
      renderMobileCosts();

      const c = compute();

      // desktop totals
      setText('t-subtotal', fmt(c.subtotal));
      setText('t-charges', '+' + fmt(c.charges));
      setText('t-disc', fmt(c.discounts));
      setText('t-net', fmt(c.net));
      setText('t-tax', '+' + fmt(c.tax));
      setText('t-tax-rate', c.rate);
      setText('t-total', fmt(c.total));
      setText('t-dp', '−' + fmt(c.dp));
      setText('t-balance', fmt(c.balance));

      document.getElementById('tax-amount-display').value = fmt(c.tax);

      // desktop installment
      setText('ins-total', fmt(c.total));
      setText('ins-down', '−' + fmt(c.dp));
      setText('ins-remain', fmt(c.balance));

      // mobile totals
      setText('m-t-subtotal', fmt(c.subtotal));
      setText('m-t-charges', '+' + fmt(c.charges));
      setText('m-t-disc', fmt(c.discounts));
      setText('m-t-tax', '+' + fmt(c.tax));
      setText('m-t-tax-rate', c.rate);
      setText('m-t-dp', '−' + fmt(c.dp));
      setText('m-t-total', fmt(c.total));
      setText('m-t-balance', fmt(c.balance));

      // plan
      const n = planCfg.n;
      const per = c.balance > 0 && n > 0 ? round2(c.balance / n) : 0;
      setText('m-per-inst', fmt(per));
      setText('m-plan-n-dsp', n);
      setText('m-plan-start-dsp', planCfg.start);
      setText('sp-base', fmt(c.balance));
      setText('sp-per', fmt(per));

      generatePlan();
    }

    function setText(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }

    /* ============ PRODUCT RENDER (desktop) ============ */
    function renderProducts() {
      const list = document.getElementById('product-rows');
      list.innerHTML = '';
      products.forEach(p => {
        const row = document.createElement('div');
        row.className = 'trow';
        const gross = lineGross(p);
        const disc = lineDiscount(p);
        const total = lineTotal(p);
        const priceCell = disc > 0 ? `<span class="strike">${fmt(gross)}</span>${fmt(total)}` : `${fmt(p.price * 1)}`;
        row.innerHTML = `
      <div class="pname">
        <div class="pthumb">${p.icon || '•'}</div>
        <div><div class="pname-t">${p.name}</div><div class="pname-s">${p.sub || ''}</div></div>
      </div>
      <div class="sku mono">${p.id}</div>
      <div><div class="qty">
        <button data-dir="-1">−</button><input value="${p.qty}"/><button data-dir="1">+</button>
      </div></div>
      <div class="price num">${priceCell}</div>
      <div class="total-cell num">${fmt(total)}</div>
      <div class="row-actions">
        <button class="icon-btn" title="Notes"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h5"/></svg></button>
        <button class="icon-btn danger" title="Remove"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button>
      </div>`;
        const [minus, plus] = row.querySelectorAll('.qty button');
        const inp = row.querySelector('.qty input');
        minus.onclick = () => { p.qty = Math.max(0, p.qty - 1); render(); };
        plus.onclick = () => { p.qty = p.qty + 1; render(); };
        inp.oninput = () => { p.qty = Math.max(0, parseInt(inp.value) || 0); render(); };
        row.querySelector('.icon-btn.danger').onclick = () => { products = products.filter(x => x.pid !== p.pid); render(); };
        list.appendChild(row);
      });
    }

    function addProduct() {
      products.push({ pid: nextPid++, id: 'NEW-00' + products.length, name: 'New Menu Item', sub: 'Tap to edit', icon: '✨', price: 9.99, qty: 1, discType: 'amount', discVal: 0, note: '' });
      render();
    }

    /* ============ COST RENDER (desktop) ============ */
    function renderCosts() {
      const list = document.getElementById('cost-rows');
      list.innerHTML = '';
      const subtotal = round2(products.reduce((s, p) => s + lineTotal(p), 0));
      costs.forEach(c => {
        const amt = costAmount(c, subtotal);
        const row = document.createElement('div');
        row.className = 'cost-row';
        const pillCls = c.type === 'discount' ? 'danger' : (c.mode === 'percent' ? 'info' : 'success');
        const pillTxt = c.type === 'discount' ? (c.mode === 'percent' ? '% Discount' : '− Discount') : (c.mode === 'percent' ? '% Charge' : '+ Charge');
        const basis = c.mode === 'percent' ? (c.val + '% of subtotal') : 'Fixed';
        row.innerHTML = `
      <div><strong>${c.desc || '(untitled)'}</strong></div>
      <div><span class="pill ${pillCls}">${pillTxt}</span></div>
      <div class="muted">${basis}</div>
      <div class="${amt < 0 ? 'amount-neg' : 'amount-pos'} num">${fmt(amt)}</div>
      <div class="row-actions"><button class="icon-btn danger"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></div>`;
        row.querySelector('.icon-btn.danger').onclick = () => { costs = costs.filter(x => x.cid !== c.cid); render(); };
        list.appendChild(row);
      });
    }

    function addCost() {
      costs.push({ cid: nextCid++, desc: 'New charge', type: 'charge', mode: 'fixed', val: 0 });
      render();
    }

    /* ============ MOBILE RENDER ============ */
    function renderMobileProducts() {
      const list = document.getElementById('m-product-list');
      list.innerHTML = '';
      if (products.length === 0) {
        list.innerHTML = '<div class="dim" style="text-align:center;padding:16px">No products yet.</div>';
        return;
      }
      products.forEach(p => {
        const row = document.createElement('div');
        row.className = 'm-prod';
        row.innerHTML = `
      <div class="pthumb">${p.icon || '•'}</div>
      <div class="meta"><div class="t">${p.name}</div><div class="s mono">Qty ${p.qty} · ${p.id}</div></div>
      <div style="text-align:right"><div class="tot num">${fmt(lineTotal(p))}</div><div class="s dim">${fmt(p.price)} ea</div></div>`;
        row.onclick = () => openProductEdit(p.pid);
        list.appendChild(row);
      });
    }
    function renderMobileCosts() {
      const list = document.getElementById('m-cost-list');
      list.innerHTML = '';
      const subtotal = round2(products.reduce((s, p) => s + lineTotal(p), 0));
      if (costs.length === 0) {
        list.innerHTML = '<div class="dim" style="text-align:center;padding:12px">No additional costs yet.</div>';
        return;
      }
      costs.forEach(c => {
        const amt = costAmount(c, subtotal);
        const row = document.createElement('div');
        row.className = 'm-cost';
        const pillCls = c.type === 'discount' ? 'danger' : 'success';
        const pillTxt = c.type === 'discount' ? '− DIS' : '+ CHG';
        const rate = c.mode === 'percent' ? (c.val + '%') : 'Fixed';
        row.innerHTML = `
      <div class="l"><span class="pill ${pillCls}">${pillTxt}</span>
        <div><div class="name">${c.desc || '(untitled)'}</div><div class="s dim" style="font-size:11px">${rate}</div></div></div>
      <div class="num" style="font-weight:700; color:${amt < 0 ? 'var(--danger)' : 'var(--text)'}">${fmt(amt)}</div>`;
        row.onclick = () => openCostSheet(c.cid);
        list.appendChild(row);
      });
    }

    /* ============ PLAN ============ */
    function generatePlan() {
      const c = compute();
      const n = Math.max(1, planCfg.n);
      const base = c.balance;
      const per = round2(base / n);
      // final row absorbs rounding remainder
      const rows = [];
      for (let i = 0; i < n; i++) {
        const amt = (i === n - 1) ? round2(base - per * (n - 1)) : per;
        rows.push(amt);
      }
      const startStr = planCfg.start;
      const [mm, dd, yyyy] = startStr.split('/').map(s => parseInt(s));
      const freq = planCfg.freq;
      const mkDate = (i) => {
        const d = new Date(yyyy || 2024, (mm || 1) - 1, dd || 1);
        if (freq === 'Monthly') d.setMonth(d.getMonth() + i);
        else if (freq === 'Bi-weekly') d.setDate(d.getDate() + i * 14);
        else if (freq === 'Weekly') d.setDate(d.getDate() + i * 7);
        else if (freq === 'Quarterly') d.setMonth(d.getMonth() + i * 3);
        return d;
      };
      const fmtDate = d => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      // desktop
      const dList = document.getElementById('plan-rows');
      dList.innerHTML = '';
      rows.forEach((amt, i) => {
        const d = mkDate(i);
        const row = document.createElement('div');
        row.className = 'plan-row';
        row.innerHTML = `<div class="idx mono">#${i + 1}</div>
      <div>${fmtDate(d)}</div>
      <div class="num" style="font-weight:600">${fmt(amt)}</div>
      <div><span class="pill amber">Pending</span></div>
      <div style="text-align:right"><button class="icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4l6 6-10 10H4v-6L14 4z"/></svg></button></div>`;
        dList.appendChild(row);
      });

      // mobile
      const mList = document.getElementById('m-plan-rows');
      mList.innerHTML = '';
      rows.forEach((amt, i) => {
        const d = mkDate(i);
        const row = document.createElement('div');
        row.className = 'm-plan-row';
        row.innerHTML = `<div class="idx mono">#${i + 1}</div>
      <div class="dd">${fmtDate(d)}</div>
      <div class="aa num">${fmt(amt)}</div>
      <div><span class="pill amber">Pending</span></div>`;
        mList.appendChild(row);
      });
    }

    /* ============ SHEETS ============ */
    function openSheet(id) {
      document.getElementById('scrim').classList.add('open');
      document.getElementById(id).classList.add('open');
      if (id === 'sheet-customer') fillCustomers();
      if (id === 'sheet-currency') fillListSimple('currency-list', CURRENCIES, 'm-currency');
      if (id === 'sheet-store') fillListSimple('store-list', STORES, 'm-store');
      if (id === 'sheet-dpacct') fillListSimple('dpacct-list', DP_ACCOUNTS, 'm-dpacct');
      if (id === 'sheet-product-pick') fillCatalog();
      if (id === 'sheet-plan-config') syncPlanSheet();
    }
    function closeAllSheets() {
      document.getElementById('scrim').classList.remove('open');
      document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
      editingPid = null; editingCid = null;
    }
    function fillCustomers() {
      const list = document.getElementById('customer-list');
      list.innerHTML = '';
      CUSTOMERS.forEach(c => {
        const b = document.createElement('button');
        b.innerHTML = `<div><div class="pr-name">${c.name}</div><div class="pr-sub mono">#${c.id} · ${c.sub}</div></div>
      <div class="pr-right">${c.balance > 0 ? 'Balance ' + fmt(c.balance) : '—'}</div>`;
        b.onclick = () => { setText('m-customer', `${c.name} (#${c.id})`); closeAllSheets(); };
        list.appendChild(b);
      });
    }
    function fillListSimple(listId, items, targetId) {
      const list = document.getElementById(listId);
      list.innerHTML = '';
      items.forEach(s => {
        const b = document.createElement('button');
        b.innerHTML = `<div class="pr-name">${s}</div>`;
        b.onclick = () => { setText(targetId, s); closeAllSheets(); };
        list.appendChild(b);
      });
    }
    function fillCatalog() {
      const list = document.getElementById('catalog-list');
      list.innerHTML = '';
      CATALOG.forEach(p => {
        const b = document.createElement('button');
        b.innerHTML = `<div style="display:flex;align-items:center;gap:10px;min-width:0"><div class="pthumb">${p.icon}</div>
      <div><div class="pr-name">${p.name}</div><div class="pr-sub mono">${p.id} · ${p.sub}</div></div></div>
      <div class="pr-right">${fmt(p.price)}</div>`;
        b.onclick = () => {
          products.push({ pid: nextPid++, id: p.id, name: p.name, sub: p.sub, icon: p.icon, price: p.price, qty: 1, discType: 'amount', discVal: 0, note: '' });
          closeAllSheets(); render();
        };
        list.appendChild(b);
      });
    }

    /* ---- Product Edit ---- */
    function openProductEdit(pid) {
      editingPid = pid;
      const p = products.find(x => x.pid === pid); if (!p) return;
      setText('pe-title', p.name);
      setText('pe-sku', 'SKU ' + p.id);
      document.getElementById('pe-qty').value = p.qty;
      document.getElementById('pe-price').value = p.price.toFixed(2);
      document.getElementById('pe-disc-val').value = p.discVal;
      document.getElementById('pe-note').value = p.note || '';
      setSeg('pe-disc-type', p.discType);
      refreshPE();
      openSheet('sheet-product-edit');
    }
    function pmQty(d) {
      const inp = document.getElementById('pe-qty');
      inp.value = Math.max(0, (parseInt(inp.value) || 0) + d); refreshPE();
    }
    function refreshPE() {
      const qty = Math.max(0, parseInt(document.getElementById('pe-qty').value) || 0);
      const price = parseNum(document.getElementById('pe-price').value);
      const dtype = segVal('pe-disc-type');
      const dval = parseNum(document.getElementById('pe-disc-val').value);
      const g = round2(price * qty);
      const d = dval <= 0 ? 0 : (dtype === 'percent' ? round2(g * dval / 100) : Math.min(g, round2(dval)));
      const t = round2(g - d);
      setText('pe-gross', fmt(g));
      setText('pe-disc-amt', '−' + fmt(d));
      setText('pe-line-total', fmt(t));
    }
    function pmSave() {
      const p = products.find(x => x.pid === editingPid); if (!p) return;
      p.qty = Math.max(0, parseInt(document.getElementById('pe-qty').value) || 0);
      p.price = parseNum(document.getElementById('pe-price').value);
      p.discType = segVal('pe-disc-type');
      p.discVal = Math.max(0, parseNum(document.getElementById('pe-disc-val').value));
      p.note = document.getElementById('pe-note').value;
      closeAllSheets(); render();
    }
    function pmRemove() {
      products = products.filter(x => x.pid !== editingPid);
      closeAllSheets(); render();
    }

    /* ---- Cost sheet ---- */
    function openCostSheet(cid) {
      if (cid) {
        editingCid = cid;
        const c = costs.find(x => x.cid === cid); if (!c) return;
        document.getElementById('cs-desc').value = c.desc;
        document.getElementById('cs-val').value = c.val.toFixed ? c.val.toFixed(2) : c.val;
        setSeg('cs-type', c.type);
        setSeg('cs-mode', c.mode);
        document.getElementById('cs-remove').style.display = '';
        setText('cs-title', 'Edit Additional Cost');
      } else {
        editingCid = null;
        document.getElementById('cs-desc').value = '';
        document.getElementById('cs-val').value = '0.00';
        setSeg('cs-type', 'charge');
        setSeg('cs-mode', 'fixed');
        document.getElementById('cs-remove').style.display = 'none';
        setText('cs-title', 'Add Additional Cost');
      }
      refreshCS();
      openSheet('sheet-cost');
    }
    function refreshCS() {
      const mode = segVal('cs-mode');
      const type = segVal('cs-type');
      const val = parseNum(document.getElementById('cs-val').value);
      const subtotal = round2(products.reduce((s, p) => s + lineTotal(p), 0));
      const raw = mode === 'percent' ? subtotal * (val / 100) : val;
      const signed = type === 'discount' ? -round2(raw) : round2(raw);
      document.getElementById('cs-computed').value = fmt(signed);
      setText('cs-val-lbl', mode === 'percent' ? 'Rate (%)' : 'Amount ($)');
    }
    function csSave() {
      const data = {
        desc: document.getElementById('cs-desc').value || 'Untitled',
        type: segVal('cs-type'),
        mode: segVal('cs-mode'),
        val: Math.max(0, parseNum(document.getElementById('cs-val').value))
      };
      if (editingCid) {
        const c = costs.find(x => x.cid === editingCid); Object.assign(c, data);
      } else {
        costs.push({ cid: nextCid++, ...data });
      }
      closeAllSheets(); render();
    }
    function csRemove() {
      costs = costs.filter(x => x.cid !== editingCid);
      closeAllSheets(); render();
    }

    /* ---- Segmented helpers ---- */
    function setSeg(id, val) {
      document.querySelectorAll('#' + id + ' button').forEach(b => b.classList.toggle('active', b.dataset.v === val));
    }
    function segVal(id) {
      const a = document.querySelector('#' + id + ' button.active');
      return a ? a.dataset.v : null;
    }
    document.addEventListener('click', e => {
      const t = e.target.closest('.seg button'); if (!t) return;
      const seg = t.parentElement;
      seg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      t.classList.add('active');
      if (seg.id === 'pe-disc-type') refreshPE();
      if (seg.id === 'cs-type' || seg.id === 'cs-mode') refreshCS();
    });
    ['pe-qty', 'pe-price', 'pe-disc-val'].forEach(id => {
      document.addEventListener('input', e => { if (e.target.id === id) refreshPE(); });
    });
    ['cs-val'].forEach(id => {
      document.addEventListener('input', e => { if (e.target.id === id) refreshCS(); });
    });

    /* ---- Date picker ---- */
    let calTarget = null, calDate = new Date(), calSel = null;
    function openDate(targetId) {
      calTarget = targetId;
      const cur = document.getElementById(targetId).textContent.trim();
      const parsed = parseDisplayDate(cur);
      calDate = parsed || new Date();
      calSel = parsed || null;
      renderCal();
      setText('cal-title', 'Select Date');
      openSheet('sheet-date');
    }
    function parseDisplayDate(s) {
      // supports "MM/DD/YYYY" or "Oct 24, 2023"
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const [mm, dd, yy] = s.split('/').map(n => parseInt(n));
        return new Date(yy, mm - 1, dd);
      }
      const d = new Date(s);
      return isNaN(d) ? null : d;
    }
    function renderCal() {
      const y = calDate.getFullYear(), m = calDate.getMonth();
      setText('cal-month', calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      const g = document.getElementById('cal-grid'); g.innerHTML = '';
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
        const el = document.createElement('div'); el.className = 'cal-dow'; el.textContent = d; g.appendChild(el);
      });
      const first = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const prevDays = new Date(y, m, 0).getDate();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      for (let i = 0; i < 42; i++) {
        const btn = document.createElement('button');
        btn.className = 'cal-day';
        let dd, other = false, dateObj;
        if (i < first) { dd = prevDays - first + 1 + i; other = true; dateObj = new Date(y, m - 1, dd); }
        else if (i >= first + daysInMonth) { dd = i - first - daysInMonth + 1; other = true; dateObj = new Date(y, m + 1, dd); }
        else { dd = i - first + 1; dateObj = new Date(y, m, dd); }
        btn.textContent = dd;
        if (other) btn.classList.add('other');
        if (+dateObj === +today) btn.classList.add('today');
        if (calSel && +dateObj === +calSel) btn.classList.add('sel');
        btn.onclick = () => { calSel = dateObj; renderCal(); };
        g.appendChild(btn);
      }
    }
    function calNav(d) { calDate.setMonth(calDate.getMonth() + d); renderCal(); }
    function calConfirm() {
      if (!calSel) { closeAllSheets(); return; }
      const s = (calSel.getMonth() + 1).toString().padStart(2, '0') + '/' + calSel.getDate().toString().padStart(2, '0') + '/' + calSel.getFullYear();
      if (calTarget === 'sp-start') { planCfg.start = s; setText('sp-start', s); render(); }
      else if (calTarget === 'm-date-posted') { const disp = calSel.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); setText('m-date-posted', disp); }
      closeAllSheets();
    }

    /* ---- Plan sheet ---- */
    function syncPlanSheet() {
      document.getElementById('sp-n').value = planCfg.n;
      setText('sp-start', planCfg.start);
      setSeg('sp-freq', planCfg.freq);
      const c = compute();
      const per = c.balance > 0 && planCfg.n > 0 ? round2(c.balance / planCfg.n) : 0;
      setText('sp-base', fmt(c.balance));
      setText('sp-per', fmt(per));
    }
    function adjPlanN(d) {
      const inp = document.getElementById('sp-n');
      inp.value = Math.max(1, (parseInt(inp.value) || 1) + d);
      syncPlanSheet();
    }
    document.addEventListener('input', e => { if (e.target.id === 'sp-n') syncPlanSheet(); });
    function applyPlanConfig() {
      planCfg.n = Math.max(1, parseInt(document.getElementById('sp-n').value) || 1);
      planCfg.freq = segVal('sp-freq') || 'Monthly';
      // start already updated by calConfirm
      document.getElementById('plan-n').value = planCfg.n;
      closeAllSheets(); render();
    }

    /* Sale type segments */
    function wireSaleType(sel) {
      document.querySelectorAll(sel + ' button').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
          btn.classList.add('active');
          const isInst = btn.dataset.v === 'installment';
          if (sel === '#sale-type') document.getElementById('card-plan').style.display = isInst ? '' : 'none';
        });
      });
    }
    wireSaleType('#sale-type'); wireSaleType('#m-sale-type');

    function toggleCard(id) { document.getElementById(id).classList.toggle('collapsed'); }
    function toggleDP() {
      const s = document.getElementById('dp-switch'); s.classList.toggle('on');
      const on = s.classList.contains('on');
      setText('dp-label', on ? 'Enabled' : 'Disabled');
      document.querySelectorAll('.dp-only').forEach(el => el.style.opacity = on ? 1 : .4);
      document.querySelectorAll('.dp-only input, .dp-only select').forEach(el => el.disabled = !on);
      render();
    }
    function mToggleDP() {
      const s = document.getElementById('m-dp-switch'); s.classList.toggle('on');
      const on = s.classList.contains('on');
      document.querySelectorAll('.m-dp-only').forEach(el => el.style.opacity = on ? 1 : .4);
      // share with desktop dp
      const d = document.getElementById('dp-switch');
      if (on !== d.classList.contains('on')) d.classList.toggle('on');
      render();
    }

    /* Tax & DP listeners */
    ['tax-scheme', 'tax-rate', 'dp-amount', 'm-dp-amount', 'plan-n', 'plan-start', 'plan-freq'].forEach(id => {
      const el = document.getElementById(id); if (!el) return;
      el.addEventListener('input', () => {
        if (id === 'm-dp-amount') { document.getElementById('dp-amount').value = el.value; }
        if (id === 'plan-n') { planCfg.n = Math.max(1, parseInt(el.value) || 1); }
        if (id === 'plan-start') { planCfg.start = el.value; }
        if (id === 'plan-freq') { planCfg.freq = el.value; }
        render();
      });
      el.addEventListener('change', () => render());
    });

    render();

    /* ============ i18n ============ */
    const T = {
      en: {
        'page-eyebrow': 'New Transaction · Installment Sale',
        'page-title': 'Create Sale Invoice',
        'page-sub': 'Record a new sale, capture payment terms, and generate an installment plan.',
        'btn-save-draft': 'Save draft', 'btn-cancel': 'Cancel', 'btn-submit': 'Submit Sale',
        'card-sale-type': 'Sale Type',
        'st-cash': 'Cash', 'st-credit': 'Credit', 'st-advance': 'Advance', 'st-installment': 'Installment',
        'card-txn': 'Transaction Details', 'card-txn-sub': 'Invoice identifiers, customer account and payment terms.',
        'lbl-currency': 'Currency', 'lbl-store': 'Store', 'lbl-date-posted': 'Date Posted',
        'lbl-customer': 'Customer Account', 'lbl-cash-acct': 'Cash Account (A/R)', 'lbl-reference': 'Reference',
        'lbl-has-dp': 'Has Down Payment', 'dp-enabled': 'Enabled', 'dp-disabled': 'Disabled',
        'lbl-dp-acct': 'Down Payment Cash / Bank Account', 'lbl-dp-amount': 'Down Payment Amount',
        'card-info': 'Additional Info',
        'lbl-desc': 'Description', 'desc-placeholder': 'Internal notes or specific customer instructions…',
        'lbl-attach': 'Attachments', 'upload-title': 'Click to upload files', 'upload-sub': 'PDF, PNG, JPG up to 10 MB',
        'card-products': 'Products', 'btn-add-product': 'Add Product',
        'th-product': 'Product Name', 'th-sku': 'SKU', 'th-qty': 'Qty', 'th-price': 'Unit Price', 'th-total': 'Line Total',
        'card-costs': 'Additional Costs & Discounts', 'card-costs-sub': 'Line-item charges and discounts. Taxes are handled separately below.',
        'btn-add-cost': 'Add Cost',
        'ch-desc': 'Description', 'ch-type': 'Type', 'ch-rate': 'Rate / Basis', 'ch-amount': 'Amount',
        'card-tax': 'Tax', 'lbl-tax-scheme': 'Tax Scheme', 'lbl-tax-rate': 'Tax Rate (%)', 'lbl-tax-basis': 'Tax Basis', 'lbl-tax-amount': 'Tax Amount',
        'tax-exclusive': 'Tax exclusive (added)', 'tax-inclusive': 'Tax inclusive (built-in)', 'tax-none': 'No tax',
        'tax-basis-val': 'Subtotal − Discounts',
        'card-plan': 'Installment Plan', 'card-plan-sub': 'Payment schedule for the balance remaining after down payment.',
        'lbl-ins-total': 'Invoice Total', 'lbl-ins-down': 'Down Payment', 'lbl-ins-remain': 'Installment Base',
        'lbl-plan-n': 'Number of Installments', 'lbl-plan-start': 'Start Date', 'lbl-plan-freq': 'Frequency',
        'btn-regen': 'Regenerate',
        'freq-monthly': 'Monthly', 'freq-biweekly': 'Bi-weekly', 'freq-weekly': 'Weekly', 'freq-quarterly': 'Quarterly',
        'plan-th-no': '#', 'plan-th-due': 'Due Date', 'plan-th-amount': 'Amount', 'plan-th-status': 'Status', 'plan-pending': 'Pending',
        'plan-note': 'Sum of installments equals the installment base exactly. The final installment absorbs any rounding remainder.',
        'totals-note': '<strong>Accounting flow.</strong> Posting this invoice will debit Accounts Receivable by the invoice total, credit Sales Revenue for the taxable net, credit Tax Payable for the tax amount, and record the down payment against Cash / Bank. Each installment creates a scheduled receivable.',
        'dt-subtotal': 'Subtotal (net of line discounts)', 'dt-charges': 'Additional Charges', 'dt-disc': 'Discounts',
        'dt-net': 'Taxable Net', 'dt-inv-total': 'Invoice Total', 'dt-dp': '− Down Payment', 'dt-balance': 'Balance to Finance',
        'view-desktop': 'Desktop', 'view-mobile': 'Mobile', 'theme-light': 'Light', 'theme-dark': 'Dark',
        'sheet-customer-title': 'Select Customer', 'sheet-customer-sub': 'Tap to choose, search by name or ID',
        'sheet-currency-title': 'Currency', 'sheet-store-title': 'Store Location', 'sheet-dpacct-title': 'Down Payment Account',
        'sheet-dpacct-sub': 'Where the cash is received',
        'sheet-product-title': 'Add Product', 'sheet-product-sub': 'Search the catalog or scan a barcode',
        'sheet-edit-title': 'Edit Product', 'pe-lbl-qty': 'Quantity', 'pe-lbl-price': 'Unit Price',
        'pe-lbl-disc': 'Line Discount', 'pe-disc-amount': 'Amount ($)', 'pe-disc-percent': 'Percent (%)',
        'pe-lbl-note': 'Note', 'pe-note-ph': 'Optional line note…', 'btn-remove': 'Remove', 'btn-save': 'Save Changes',
        'sheet-cost-title': 'Add Additional Cost', 'sheet-cost-sub': 'Charge or discount applied to this invoice',
        'cs-desc-ph': 'e.g. Shipping, Tip, Loyalty Discount',
        'cs-type-lbl': 'Type', 'cs-charge': '+ Charge', 'cs-discount': '− Discount',
        'cs-calc-lbl': 'Calculation', 'cs-fixed': 'Fixed ($)', 'cs-percent': 'Percent (%)',
        'cs-computed-lbl': 'Computed Amount', 'btn-cs-save': 'Save',
        'sheet-date-title': 'Select Date', 'btn-cal-set': 'Set Date',
        'sheet-manual-title': 'Enter Barcode', 'barcode-lbl': 'Barcode', 'barcode-ph': 'e.g. 0123456789012', 'btn-lookup': 'Look Up',
        'sheet-plan-title': 'Installment Plan', 'sp-lbl-n': 'Installments', 'sp-lbl-freq': 'Frequency',
        'sp-lbl-start': 'Start Date', 'sp-lbl-base': 'Installment Base', 'sp-lbl-per': 'Per-Installment',
        'btn-apply': 'Apply',
        'search-ph': 'Search customers…', 'search-prod-ph': 'Search products or scan…',
        'confirm': 'Confirm Selection',
        'm-new-txn': 'New Transaction', 'm-create-invoice': 'Create Invoice',
        'm-has-dp': 'Has Down Payment',
        'm-scanner-title': 'Barcode Scanner', 'm-scan-manual': 'Scan Manually', 'm-scan-hint': 'Can\'t scan? Enter barcode manually.',
        'm-plan-edit': 'Edit', 'm-show-all': 'Show all Installments',
        'm-summary-title': 'Invoice Summary',
        'm-charges': 'Charges', 'm-discounts': 'Discounts', 'm-dp-lbl': '− Down Payment', 'm-balance': 'Balance to Finance',
        'm-inv-total': 'Invoice Total', 'm-per-inst': 'Per-Installment Payment',
        'btn-submit-mobile': 'Submit Invoice',
        'upload-tap': 'Tap to upload',
        'add-lbl': 'Add',
        'add-cost-lbl': 'Add Cost',
      },
      ar: {
        'page-eyebrow': 'معاملة جديدة · بيع بالتقسيط',
        'page-title': 'إنشاء فاتورة مبيعات',
        'page-sub': 'سجّل عملية بيع جديدة وحدّد شروط الدفع وأنشئ خطة التقسيط.',
        'btn-save-draft': 'حفظ كمسودة', 'btn-cancel': 'إلغاء', 'btn-submit': 'تسجيل البيع',
        'card-sale-type': 'نوع البيع',
        'st-cash': 'نقدي', 'st-credit': 'آجل', 'st-advance': 'مقدّم', 'st-installment': 'تقسيط',
        'card-txn': 'تفاصيل المعاملة', 'card-txn-sub': 'معرّفات الفاتورة وحساب العميل وشروط الدفع.',
        'lbl-currency': 'العملة', 'lbl-store': 'المتجر', 'lbl-date-posted': 'تاريخ الترحيل',
        'lbl-customer': 'حساب العميل', 'lbl-cash-acct': 'حساب النقدية (ذمم مدينة)', 'lbl-reference': 'المرجع',
        'lbl-has-dp': 'يوجد دفعة مقدمة', 'dp-enabled': 'مفعّل', 'dp-disabled': 'معطّل',
        'lbl-dp-acct': 'حساب الدفعة المقدمة (نقد/بنك)', 'lbl-dp-amount': 'مبلغ الدفعة المقدمة',
        'card-info': 'معلومات إضافية',
        'lbl-desc': 'الوصف', 'desc-placeholder': 'ملاحظات داخلية أو تعليمات خاصة بالعميل…',
        'lbl-attach': 'المرفقات', 'upload-title': 'انقر لرفع الملفات', 'upload-sub': 'PDF أو PNG أو JPG حتى 10 ميجابايت',
        'card-products': 'المنتجات', 'btn-add-product': 'إضافة منتج',
        'th-product': 'اسم المنتج', 'th-sku': 'كود المنتج', 'th-qty': 'الكمية', 'th-price': 'سعر الوحدة', 'th-total': 'إجمالي السطر',
        'card-costs': 'التكاليف والخصومات الإضافية', 'card-costs-sub': 'الرسوم والخصومات على مستوى السطر. يتم التعامل مع الضريبة بشكل منفصل أدناه.',
        'btn-add-cost': 'إضافة تكلفة',
        'ch-desc': 'الوصف', 'ch-type': 'النوع', 'ch-rate': 'النسبة / الأساس', 'ch-amount': 'المبلغ',
        'card-tax': 'الضريبة', 'lbl-tax-scheme': 'نظام الضريبة', 'lbl-tax-rate': 'نسبة الضريبة (%)', 'lbl-tax-basis': 'أساس الضريبة', 'lbl-tax-amount': 'مبلغ الضريبة',
        'tax-exclusive': 'ضريبة خارجية (تُضاف)', 'tax-inclusive': 'ضريبة شاملة', 'tax-none': 'بدون ضريبة',
        'tax-basis-val': 'الإجمالي الفرعي − الخصومات',
        'card-plan': 'خطة التقسيط', 'card-plan-sub': 'جدول السداد للرصيد المتبقي بعد الدفعة المقدمة.',
        'lbl-ins-total': 'إجمالي الفاتورة', 'lbl-ins-down': 'الدفعة المقدمة', 'lbl-ins-remain': 'أساس التقسيط',
        'lbl-plan-n': 'عدد الأقساط', 'lbl-plan-start': 'تاريخ البداية', 'lbl-plan-freq': 'الدورية',
        'btn-regen': 'إعادة إنشاء',
        'freq-monthly': 'شهري', 'freq-biweekly': 'أسبوعان', 'freq-weekly': 'أسبوعي', 'freq-quarterly': 'ربع سنوي',
        'plan-th-no': '#', 'plan-th-due': 'تاريخ الاستحقاق', 'plan-th-amount': 'المبلغ', 'plan-th-status': 'الحالة', 'plan-pending': 'معلّق',
        'plan-note': 'مجموع الأقساط يساوي أساس التقسيط بالضبط. القسط الأخير يستوعب أي فرق في التقريب.',
        'totals-note': '<strong>مسار المحاسبة.</strong> عند الترحيل، سيتم خصم الذمم المدينة بإجمالي الفاتورة، وإضافة إيرادات المبيعات للصافي الخاضع للضريبة، وإضافة الضريبة المستحقة، وتسجيل الدفعة المقدمة على النقد/البنك. كل قسط ينشئ ذمة مجدولة.',
        'dt-subtotal': 'الإجمالي الفرعي (بعد خصومات السطر)', 'dt-charges': 'التكاليف الإضافية', 'dt-disc': 'الخصومات',
        'dt-net': 'الصافي الخاضع للضريبة', 'dt-inv-total': 'إجمالي الفاتورة', 'dt-dp': '− الدفعة المقدمة', 'dt-balance': 'الرصيد الممول',
        'view-desktop': 'سطح المكتب', 'view-mobile': 'الجوال', 'theme-light': 'فاتح', 'theme-dark': 'داكن',
        'sheet-customer-title': 'اختيار العميل', 'sheet-customer-sub': 'اضغط للاختيار أو ابحث بالاسم أو الرقم',
        'sheet-currency-title': 'العملة', 'sheet-store-title': 'موقع المتجر', 'sheet-dpacct-title': 'حساب الدفعة المقدمة',
        'sheet-dpacct-sub': 'الحساب الذي يُستلم فيه النقد',
        'sheet-product-title': 'إضافة منتج', 'sheet-product-sub': 'ابحث في الكتالوج أو امسح الباركود',
        'sheet-edit-title': 'تعديل المنتج', 'pe-lbl-qty': 'الكمية', 'pe-lbl-price': 'سعر الوحدة',
        'pe-lbl-disc': 'خصم السطر', 'pe-disc-amount': 'المبلغ ($)', 'pe-disc-percent': 'نسبة مئوية (%)',
        'pe-lbl-note': 'ملاحظة', 'pe-note-ph': 'ملاحظة اختيارية…', 'btn-remove': 'حذف', 'btn-save': 'حفظ التغييرات',
        'sheet-cost-title': 'إضافة تكلفة إضافية', 'sheet-cost-sub': 'رسوم أو خصم على هذه الفاتورة',
        'cs-desc-ph': 'مثل: شحن، إكرامية، خصم ولاء',
        'cs-type-lbl': 'النوع', 'cs-charge': '+ رسوم', 'cs-discount': '− خصم',
        'cs-calc-lbl': 'طريقة الحساب', 'cs-fixed': 'ثابت ($)', 'cs-percent': 'نسبة مئوية (%)',
        'cs-computed-lbl': 'المبلغ المحسوب', 'btn-cs-save': 'حفظ',
        'sheet-date-title': 'اختيار التاريخ', 'btn-cal-set': 'تحديد التاريخ',
        'sheet-manual-title': 'إدخال الباركود', 'barcode-lbl': 'الباركود', 'barcode-ph': 'مثال: 0123456789012', 'btn-lookup': 'بحث',
        'sheet-plan-title': 'خطة التقسيط', 'sp-lbl-n': 'عدد الأقساط', 'sp-lbl-freq': 'الدورية',
        'sp-lbl-start': 'تاريخ البداية', 'sp-lbl-base': 'أساس التقسيط', 'sp-lbl-per': 'قيمة القسط',
        'btn-apply': 'تطبيق',
        'search-ph': 'بحث عن العملاء…', 'search-prod-ph': 'ابحث عن المنتجات أو امسح الباركود…',
        'confirm': 'تأكيد الاختيار',
        'm-new-txn': 'معاملة جديدة', 'm-create-invoice': 'إنشاء فاتورة',
        'm-has-dp': 'يوجد دفعة مقدمة',
        'm-scanner-title': 'ماسح الباركود', 'm-scan-manual': 'مسح يدوي', 'm-scan-hint': 'لا يمكن المسح؟ أدخل الباركود يدوياً.',
        'm-plan-edit': 'تعديل', 'm-show-all': 'عرض جميع الأقساط',
        'm-summary-title': 'ملخص الفاتورة',
        'm-charges': 'الرسوم', 'm-discounts': 'الخصومات', 'm-dp-lbl': '− الدفعة المقدمة', 'm-balance': 'الرصيد الممول',
        'm-inv-total': 'إجمالي الفاتورة', 'm-per-inst': 'قيمة القسط الشهري',
        'btn-submit-mobile': 'تسجيل الفاتورة',
        'upload-tap': 'اضغط للرفع',
        'add-lbl': 'إضافة',
        'add-cost-lbl': 'إضافة تكلفة',
      }
    };

    let currentLang = localStorage.getItem('invoice-lang') || 'en';

    function applyLang(lang) {
      currentLang = lang;
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
      localStorage.setItem('invoice-lang', lang);
      document.getElementById('lang-label').textContent = lang === 'ar' ? 'EN' : 'عربي';
      // Apply all data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (T[lang][key] !== undefined) el.innerHTML = T[lang][key];
      });
      // Update view toggle labels
      document.querySelectorAll('.view-toggle button').forEach(b => {
        if (b.dataset.view === 'desktop') b.childNodes[b.childNodes.length - 1].textContent = ' ' + T[lang]['view-desktop'];
        if (b.dataset.view === 'mobile') b.childNodes[b.childNodes.length - 1].textContent = ' ' + T[lang]['view-mobile'];
      });
      // Update theme label
      const themeVal = root.getAttribute('data-theme');
      setText('theme-label', themeVal === 'dark' ? T[lang]['theme-dark'] : T[lang]['theme-light']);
      // Update sale type buttons
      document.querySelectorAll('#sale-type button, #m-sale-type button').forEach(b => {
        if (b.dataset.v) b.textContent = T[lang]['st-' + b.dataset.v] || b.textContent;
      });
      // Update tax scheme options
      const taxScheme = document.getElementById('tax-scheme');
      if (taxScheme) {
        taxScheme.options[0].text = T[lang]['tax-exclusive'];
        taxScheme.options[1].text = T[lang]['tax-inclusive'];
        taxScheme.options[2].text = T[lang]['tax-none'];
      }
      // Update plan freq options
      const planFreq = document.getElementById('plan-freq');
      if (planFreq) {
        planFreq.options[0].text = T[lang]['freq-monthly'];
        planFreq.options[1].text = T[lang]['freq-biweekly'];
        planFreq.options[2].text = T[lang]['freq-weekly'];
        planFreq.options[3].text = T[lang]['freq-quarterly'];
      }
      // Re-render to pick up translated plan row status
      render();
    }

    document.getElementById('lang-toggle').addEventListener('click', () => {
      applyLang(currentLang === 'ar' ? 'en' : 'ar');
    });

    applyLang(currentLang);

/* ============ INIT ============ */
window.AppDataLoader.loadAll(['demo-i18n-create-invoice', 'demo-create-invoice']).then(data => {
  if (data['demo-i18n-create-invoice']) {
    window.AppI18n.register(data['demo-i18n-create-invoice']);
  }
  const d = data['demo-create-invoice'];
  if (d) {
    CATALOG = d.CATALOG || [];
    CUSTOMERS = d.CUSTOMERS || [];
    STORES = d.STORES || [];
    CURRENCIES = d.CURRENCIES || [];
    DP_ACCOUNTS = d.DP_ACCOUNTS || [];
    products = d.products || [];
    costs = d.costs || [];
    planCfg = d.planCfg || {};
  }

  // Handle local dynamic translations
  function updateDynamicI18n() {
    const t = window.AppI18n.t;
    document.querySelectorAll('#sale-type button, #m-sale-type button').forEach(b => {
      if (b.dataset.v) {
        const val = t('st-' + b.dataset.v);
        if (val) b.textContent = val;
      }
    });
    const taxScheme = document.getElementById('tax-scheme');
    if (taxScheme) {
      taxScheme.options[0].text = t('tax-exclusive');
      taxScheme.options[1].text = t('tax-inclusive');
      taxScheme.options[2].text = t('tax-none');
    }
    const planFreq = document.getElementById('plan-freq');
    if (planFreq) {
      planFreq.options[0].text = t('freq-monthly');
      planFreq.options[1].text = t('freq-biweekly');
      planFreq.options[2].text = t('freq-weekly');
      planFreq.options[3].text = t('freq-quarterly');
    }
    render();
  }

  window.AppI18n.onChange(updateDynamicI18n);

  window.AppBootstrap.init({
    i18n: ['demo-i18n-common']
  }).then(() => {
    updateDynamicI18n();
    render();
  });
});
